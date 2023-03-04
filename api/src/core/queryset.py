from django.db.models import QuerySet, Value


class BetaMoveQuerySet(QuerySet):
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
