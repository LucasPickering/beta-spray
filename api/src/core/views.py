from django.http import HttpRequest, HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from guest_user.mixins import AllowGuestUserMixin
from strawberry.django.views import GraphQLView


# Inheritance order is important here!
class BetaSprayGraphQLView(AllowGuestUserMixin, GraphQLView):
    """
    Extension of GraphQLView that provides guest user functionality
    """

    # I *believe* disabling CSRF is safe because we don't allow any CORS
    # requests .Most GQL requests are not "simple" in a CORS sense, but there
    # is possibily a vulnerability related to form uploads (needed for uploading
    # images).
    # https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    # This issue does concern me though:
    # https://github.com/strawberry-graphql/strawberry/issues/1710
    # I tested this myself by writing a malicious site that tries to upload
    # a problem with a form request, and both Firefox and Chrome rejected it
    # because the server doesn't return a Access-Control-Allow-Origin header.
    # So I *think* we're good but still a little nervous...
    @method_decorator(csrf_exempt)
    def dispatch(self, request: HttpRequest) -> HttpResponse:
        return super().dispatch(request)
