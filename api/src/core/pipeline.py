from typing import Any

from django.contrib.auth.models import User
from guest_user.functions import get_guest_model


def convert_guest_user(user: User, *args: Any, **kwargs: Any) -> None:
    """
    Convert a guest user to a full blown one after they log in with social
    """
    get_guest_model().objects.filter(user=user).delete()
