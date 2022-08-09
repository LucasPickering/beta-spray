import logging
import time

from graphql import OperationType

graphql_logger = logging.getLogger("beta_spray.graphql")

# ===== Graphene Middleware =====


class LogMiddleware:
    """
    Graphene middleware to log all queries and mutations. Note: this is *not*
    Django middleware!
    """

    logger = logging.getLogger("beta_spray.graphql")

    def resolve(self, next, root, info, *args, **kwargs):
        # Log all mutations (but only at the top level, not queried fields)
        if (
            info.operation.operation == OperationType.MUTATION
            and info.path.prev is None
        ):
            self.logger.info(
                f"mutation {info.field_name} {info.variable_values}"
            )

        # Log errors with more detail
        try:
            return next(root, info, *args, **kwargs)
        except Exception as e:
            # TODO better formatting
            self.logger.error(
                f"Error handling GraphQL request:\n{info}", exc_info=e
            )
            raise e


class ErrorMiddleware:
    """
    Graphene middleware to properly forward errors. Note: this is *not* Django
    middleware!
    """

    def resolve(self, next, root, info, *args, **kwargs):
        if info.path.prev is None:
            print(info)
        try:
            return next(root, info, *args, **kwargs)
        except Exception as e:
            # TODO better formatting
            graphql_logger.error(
                f"Error handling GraphQL request:\n{info}", exc_info=e
            )
            raise e


# ===== Django Middleware =====


class TimeDelayMiddleware:
    """
    Development middleware to simulate latency in API calls. Useful for
    testing UI performance/layout shift, since throttle individual URLs isn't
    possible via browser tools.
    """

    delay = 3.0  # Per-request delay, in seconds

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only delay GraphQL calls, not static assets/media
        if request.path == "/api/graphql":
            time.sleep(self.delay)
        return self.get_response(request)
