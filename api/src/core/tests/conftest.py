import pytest
from django.contrib.auth.models import User

from bs_auth.models import UserProfile


@pytest.fixture
def user_guest() -> User:
    user = User.objects.create(username="TODO")
    user.profile = UserProfile(user=user, is_guest=True)
    user.save()
    return user


@pytest.fixture
def user_resident() -> User:
    user = User.objects.create(username="TODO")
    user.profile = UserProfile(user=user)
    user.save()
    return user
