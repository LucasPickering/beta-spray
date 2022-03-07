from django.db.models import F, QuerySet, Max
from django.forms import ValidationError


class BetaMoveQuerySet(QuerySet):
    def add_to_beta(self, beta_id, order, body_part, hold_id=None):
        # If the beta ID is invalid, the first query will do nothing, but the
        # second will fail.

        if order is not None:
            self.validate_order(beta_id=beta_id, order=order)

            # Slide down the existing moves to make room for the new one
            self.slide_moves(beta_id=beta_id, from_order=order, down=True)
        else:
            # If order isn't given, just do max+1
            order = (
                self.filter(beta_id=beta_id)
                .aggregate(max_order=Max("order") + 1)
                .get("max_order", 0)
            )

        beta_move = self.create(
            beta_id=beta_id,
            order=order,
            hold_id=hold_id,
            body_part=body_part,
        )

        return beta_move

    def update_in_beta(self, beta_move_id, order=None, hold_id=None):
        beta_move = self.get(id=beta_move_id)

        if order is not None:
            self.validate_order(beta_id=beta_move.beta_id, order=order)

            # Slide other moves either up or down to make room for this new
            # order value, and to fill the gap left by the old one
            self.slide_moves(
                beta_id=beta_move.beta_id,
                from_order=beta_move.order,
                # "Down" means further down the list, i.e. *larger* order values
                # So slide *down* if the updated move is moving *up*
                down=order < beta_move.order,
            )
            beta_move.order = order

        if hold_id is not None:
            beta_move.hold_id = hold_id

        beta_move.save()
        return beta_move

    def delete_from_beta(self, beta_move_id):
        # TODO DRF for validation
        beta_move = self.get(id=beta_move_id)

        # `object.delete()` wipes out the PK field for some reason ¯\_(ツ)_/¯
        self.filter(id=beta_move.id).delete()

        # Collapse down order values to fill in the gap
        self.slide_moves(
            beta_id=beta_move.beta_id, from_order=beta_move.order, down=False
        )

        return beta_move

    def slide_moves(self, beta_id, from_order, down=True):
        """
        TODO
        """

        update_stmt = F("order") + 1 if down else F("order") - 1
        self.filter(beta_id=beta_id, order__gte=from_order).update(
            order=update_stmt
        )

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
