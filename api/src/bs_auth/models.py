import logging

from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import models
from django.http import HttpRequest
from random_username.generate import generate_username

from core.models import Beta, Problem

logger = logging.getLogger(__name__)


class UserProfile(models.Model):
    """
    An extension of the User model to store additional data for a user. The
    authentication system will enforce that a profile is created for every new
    user, so *it is safe to assume that ever user has a profile!*
    """

    user = models.OneToOneField(
        User, related_name="profile", on_delete=models.CASCADE
    )
    is_guest = models.BooleanField(
        default=False,
        help_text="Is the user *not* fully authenticated?",
    )

    @classmethod
    def maybe_create_guest(cls, request: HttpRequest) -> None:
        """
        Create a new guest user for the request, *if* the user is currently
        anonymous. The guest user will have username and profile created.
        """
        if request.user.is_anonymous:
            username = generate_username()[0]
            logger.info(
                f"Creating new guest user with username {username}"
                f" for request {request}"
            )
            user = User.objects.create_user(username=username)
            cls.objects.create(user=user, is_guest=True)

            user = authenticate(request=request, username=username)
            login(request, user)

    def absorb(self, other_user: User) -> None:
        """
        Take ownership of all objects owned by the given user, then delete them
        """
        # Link the guest into the existing user. The guest user may
        # own some objects, so we need to update those to point to the
        # new owner. We'll have to add to this list any time we add
        # `owner` columns, which kinda sucks
        Problem.objects.filter(owner=other_user).update(owner=self.user)
        Beta.objects.filter(owner=other_user).update(owner=self.user)

        other_user.delete()

    def convert_guest(self) -> None:
        """
        Convert a guest user into a regular user. Should be called after login.
        """
        self.is_guest = False
        self.save()
