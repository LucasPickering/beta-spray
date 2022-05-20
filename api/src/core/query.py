from enum import Enum
from django.db.models import F, Q, QuerySet, Max, Value
from django.db.models.functions import Coalesce
from django.db import transaction
from django.forms import ValidationError

# TODO move all this automatic order-sliding logic into model triggers, so we
# can catch everything


class SlideDirection(Enum):
    DOWN = "down"
    UP = "up"


class BetaMoveQuerySet(QuerySet):
    @transaction.atomic
    def add_to_beta(self, beta_id, order, body_part, hold_id=None):
        # If the beta ID is invalid, the first query will do nothing, but the
        # second will fail.

        if order is not None:
            self.validate_order(beta_id=beta_id, order=order)

            # Slide down the existing moves to make room for the new one
            self.slide_moves(
                beta_id=beta_id, direction=SlideDirection.DOWN, from_order=order
            )
        else:
            # If order isn't given, just do max+1
            order = (
                self.filter(beta_id=beta_id)
                # This is needed to prevent django adding a GROUP BY that breaks
                # the query
                # https://stackoverflow.com/a/64902200/1907353
                .annotate(dummy_group_by=Value(1))
                .values("dummy_group_by")
                # Similarly, the default ORDER BY also breaks the query, once
                # again I have no idea why but it's an easy fix
                .order_by()
                .annotate(next_order=Coalesce(Max("order") + 1, 0))
                .values("next_order")
            )

        beta_move = self.create(
            beta_id=beta_id,
            order=order,
            hold_id=hold_id,
            body_part=body_part,
        )

        return beta_move

    @transaction.atomic
    def update_in_beta(self, beta_move_id, order=None, hold_id=None):
        beta_move = self.get(id=beta_move_id)

        if order is not None:
            self.validate_order(beta_id=beta_move.beta_id, order=order)

            if order > beta_move.order:
                # We're moving an item *down* the list (larger order values),
                # which means everything in between must move *up*
                self.slide_moves(
                    beta_id=beta_move.beta_id,
                    direction=SlideDirection.UP,
                    from_order=beta_move.order + 1,
                    to_order=order,
                )
            else:
                # We're moving *up*, so everything in between goes *down*
                self.slide_moves(
                    beta_id=beta_move.beta_id,
                    direction=SlideDirection.DOWN,
                    from_order=order,
                    to_order=beta_move.order - 1,
                )
            beta_move.order = order

        if hold_id is not None:
            beta_move.hold_id = hold_id

        beta_move.save()
        return beta_move

    @transaction.atomic
    def delete_from_beta(self, beta_move_id):
        # TODO DRF for validation
        beta_move = self.get(id=beta_move_id)

        # `object.delete()` wipes out the PK field for some reason ¯\_(ツ)_/¯
        self.filter(id=beta_move.id).delete()

        # Collapse order values to fill in the gap
        self.slide_moves(
            beta_id=beta_move.beta_id,
            direction=SlideDirection.UP,
            from_order=beta_move.order,
        )

        return beta_move

    def slide_moves(self, beta_id, direction, from_order, to_order=None):
        """
        Slide the moves in a beta either up or down one slot, starting from a
        given order and optionally ending at another order. If `to_order` is
        not given, this will go to the beginning/end of the list.

        `from_order` and `to_order` are both inclusive.

        In this case, "down" means "increasing order". The metaphor is of a
        vertical list of increasing orders.
        """

        if direction == SlideDirection.DOWN:
            order_expr = F("order") + 1
        elif direction == SlideDirection.UP:
            order_expr = F("order") - 1
        else:
            raise ValueError(f"Unexpected slide direction: {direction}")

        # Find our window basic on from/to values
        filter = Q(beta_id=beta_id, order__gte=from_order)
        if to_order is not None:
            filter &= Q(order__lte=to_order)

        self.filter(filter).update(order=order_expr)

    def validate_order(self, beta_id, order):
        # TODO use DRF for validation
        max_order = (
            self.filter(beta_id=beta_id)
            .aggregate(max_order=Max("order") + 1)
            .get("max_order", 0)
        )
        # If order value is greater than the next expected value, give an error
        if order < 0 or order > max_order:
            raise ValidationError(
                f"order cannot be higher than {max_order}, but was {order}"
            )
