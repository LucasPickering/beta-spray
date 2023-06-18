from unittest.mock import Mock

import pytest
from django.contrib.auth import login
from django.contrib.auth.models import User
from strawberry.django.context import StrawberryDjangoContext


@pytest.fixture
def context_anonymous(mocker: Mock) -> StrawberryDjangoContext:
    """GraphQL request context with no authenticated user"""

    class Session(dict):
        def cycle_key(self) -> None:
            pass

        def flush(self) -> None:
            pass

    context = mocker.Mock()
    context.request.session = Session()
    return context


@pytest.fixture
def context_guest(
    context_anonymous: StrawberryDjangoContext, user_guest: User
) -> StrawberryDjangoContext:
    """GraphQL request context with a guest user"""
    login(
        context_anonymous.request,
        user_guest,
        backend="django.contrib.auth.backends.ModelBackend",
    )
    return context_anonymous


@pytest.fixture
def context_resident(
    context_anonymous: StrawberryDjangoContext, user_resident: User
) -> StrawberryDjangoContext:
    """
    GraphQL request context with a resident (i.e. *not* guest) user
    """
    login(
        context_anonymous.request,
        user_resident,
        backend="django.contrib.auth.backends.ModelBackend",
    )
    return context_anonymous
