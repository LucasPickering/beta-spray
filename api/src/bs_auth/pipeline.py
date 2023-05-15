from typing import Any

from django.contrib.auth import login
from django.contrib.auth.models import User
from django.http import HttpRequest
from social_core.backends.base import BaseAuth
from social_core.exceptions import AuthAlreadyAssociated


def find_existing_user(
    backend: BaseAuth,
    uid: str,
    request: HttpRequest,
    user: User = None,
    *args: Any,
    **kwargs: Any,
) -> dict:
    """
    A copy of the stock social_user pipeline, modified to allow linking guest
    users to existing users.
    """
    provider = backend.name
    social = backend.strategy.storage.user.get_social_auth(provider, uid)
    # `user` is the *potential* existing user
    # `social.user` is user that's currently logging in
    if social:
        if user and social.user != user:
            if user.profile.is_guest:
                # Merge the existing guest into the authenticated user
                social.user.profile.absorb(user)
                user = social.user
                # Update the request session to point to the logged-in user
                backend_class = backend.__class__
                login(
                    request,
                    user,
                    # This is a bit jank but I can't figure out how else to get
                    # the backend import path from the value
                    f"{backend_class.__module__}.{backend_class.__name__}",
                )
            else:
                # This *shouldn't* happen, because it implies user was already
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
    user.profile.convert_guest()
