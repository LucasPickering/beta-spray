from django.db.models import (
    Q,
    Min,
    Max,
    Value,
    ExpressionWrapper,
    Subquery,
    QuerySet,
    BooleanField,
    OuterRef,
)
from django.db.models.functions import Coalesce


class BetaMoveQuerySet(QuerySet):
    def annotate_all(self):
        """
        Annotate all common fields
        """
        return self.annotate_is_start().annotate_is_last_in_chain()

    def annotate_is_start(self):
        """
        Annotate a field that notates if each move is a start move for that
        beta. A start move is any move made before the first time a body part
        makes a *second* move on the wall. Therefore there is anywhere between
        1 and 4 start moves for a beta (typically 3-4).
        """

        # A helper queryset that we use a couple times. This is used in the
        # subqueries to make sure we're only aggregating within the context of
        # the beta in question.
        filtered = self.model.objects.filter(beta_id=OuterRef("beta_id"))
        return self.annotate(
            # We'll find the lowest order that *isn't* a start move, then
            # annotate each row by comparing against that
            is_start=ExpressionWrapper(
                Q(
                    order__lt=Subquery(
                        # Get the first non-start move by finding the lowest
                        # order that isn't the first of its body part
                        filtered.exclude(
                            # Find the first move for each body part
                            order__in=filtered.values("body_part")
                            .annotate(min_order=Min("order"))
                            .values("min_order")
                        )
                        # Remove annoying django clauses that break shit
                        .remove_group_by_order_by()
                        # If no body part has more than 1 move, everything is
                        # a start move so make up a fake "non-start" order. By
                        # the pigeon hole principle, this magic number just
                        # needs to be more than the number of body parts
                        .annotate(
                            first_non_start=Coalesce(Min("order"), 9999)
                        ).values("first_non_start")
                    )
                ),
                output_field=BooleanField(),
            )
        )

    def annotate_is_last_in_chain(self):
        """
        Annotate a field that notates if each move is the last in the beta *for
        its corresponding body part*. Each body part gets a different visual
        chain in the UI, and this field indicates which move is the final one
        in each chain. See, doesn't it make sense now?
        """
        return self.annotate(
            is_last_in_chain=ExpressionWrapper(
                Q(
                    # For each move, check if it's the highest order for that
                    # body part.
                    # This subquery may be inefficient, not sure if pg is smart
                    # enough to only run the MAX query once per beta/body part.
                    order=Subquery(
                        self.model.objects.filter(
                            beta_id=OuterRef("beta_id"),
                            body_part=OuterRef("body_part"),
                        )
                        # Remove annoying django clauses that break shit
                        .remove_group_by_order_by()
                        .annotate(last_in_chain=Max("order"))
                        .values("last_in_chain")
                    )
                ),
                output_field=BooleanField(),
            )
        )

    def remove_group_by_order_by(self):
        """
        Prevent Django from generating a GROUP BY or ORDER BY clause on this
        query. This is needed in some complex query situations, when Django is
        being annoying.
        """
        return (
            # Prevent django adding a GROUP BY that can break queries
            # https://stackoverflow.com/a/64902200/1907353
            self.annotate(dummy_group_by=Value(1)).values("dummy_group_by")
            # Similarly, the default ORDER BY can also break queries,
            # once again I have no idea why but it's an easy fix
            .order_by()
        )
