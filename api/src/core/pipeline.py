from typing import Any

from django.contrib.auth.models import User
from guest_user.functions import get_guest_model, is_guest_user
from social_core.backends.base import BaseAuth
from social_core.exceptions import AuthAlreadyAssociated

from .models import Beta, Problem


def find_existing_user(
    backend: BaseAuth, uid: str, user: User = None, *args: Any, **kwargs: Any
) -> dict:
    """
    A copy of the stock social_user pipeline, modified to allow linking guest
    users to existing users.
    """
    provider = backend.name
    social = backend.strategy.storage.user.get_social_auth(provider, uid)
    if social:
        if user and social.user != user:
            if is_guest_user(user):
                # Link the guest into the existing user. THe guest user may
                # own some objects, so we need to update those to point to the
                # new owner. We'll have to add to this list any time we add
                # `owner` columns, which kinda sucks
                Problem.objects.filter(owner=user).update(owner=social.user)
                Beta.objects.filter(owner=user).update(owner=social.user)

                user.delete()
                user = social.user
                # TODO this doesn't reassign the request session, so the user
                # isn't logged in at the end of the request. Fix this.
            else:
                # This *shouldn't* happen, because it implies was already
                # logged in under a regular account, then tried to log in again.
                # The login screen should only be visible if the user is
                # unauthenticated or a guest
                raise AuthAlreadyAssociated(backend)
        elif not user:
            # User doesn't exist yet
            user = social.user
    return {
        "social": social,
        "user": user,
        "is_new": user is None,
        "new_association": social is None,
    }


def convert_guest_user(user: User, *args: Any, **kwargs: Any) -> None:
    """
    Convert a guest user to a full blown one after they log in with social
    """
    get_guest_model().objects.filter(user=user).delete()
