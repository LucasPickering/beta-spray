from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.http import HttpRequest


class GuestBackend(ModelBackend):
    """
    Auth backend for new guest users.
    Ripped from https://github.com/julianwachholz/django-guest-user
    """

    def authenticate(
        self,
        request: HttpRequest,
        username: str | None = None,
        password: str | None = None,
        **kwargs: dict
    ) -> User | None:
        """Authenticate with username only."""

        if password is not None:
            # Prevent authentication when a password was supplied and
            # all previous authentication backends have failed.
            return None

        UserModel = get_user_model()

        try:
            user = UserModel.objects.get(**{UserModel.USERNAME_FIELD: username})
        except UserModel.DoesNotExist:
            return None
        if user.profile and user.profile.is_guest:
            return user
        return None

    def get_user(self, user_id: str) -> User | None:
        UserModel = get_user_model()
        try:
            user = UserModel._default_manager.get(pk=user_id)
        except UserModel.DoesNotExist:
            return None
        return user
