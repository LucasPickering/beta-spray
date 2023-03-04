import logging
import time
from typing import Callable

from django.http.request import HttpRequest
from django.http.response import HttpResponse

graphql_logger = logging.getLogger("beta_spray.graphql")


class TimeDelayMiddleware:
    """
    Development middleware to simulate latency in API calls. Useful for
    testing UI performance/layout shift, since throttle individual URLs isn't
    possible via browser tools.
    """

    delay = 3.0  # Per-request delay, in seconds

    def __init__(
        self, get_response: Callable[[HttpRequest], HttpResponse]
    ) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        # Only delay GraphQL calls, not static assets/media
        if request.path == "/api/graphql":
            time.sleep(self.delay)
        return self.get_response(request)
