import logging
import time
from django.conf import settings

logger = logging.getLogger(__name__)


class ErrorMiddleware:
    """
    Graphene middleware to properly forward errors. Note: this is *not* Django
    middleware!
    """

    def resolve(self, next, root, info, *args, **kwargs):
        try:
            return next(root, info, *args, **kwargs)
        except Exception as e:
            # TODO better formatting
            logger.error(f"Error handling GraphQL request:\n{info}", exc_info=e)
            raise e


class TimeDelayMiddleware:
    """
    Development middleware to simulate latency in API calls. Useful for
    testing UI performance/layout shift, since throttle individual URLs isn't
    possible via browser tools.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only delay GraphQL calls, not static assets/media
        if settings.REQUEST_TIME_DELAY and request.path == "/api/graphql":
            time.sleep(settings.REQUEST_TIME_DELAY)
        return self.get_response(request)
