from unittest.mock import Mock

import pytest
from django.contrib.auth import login
from django.contrib.auth.models import User
from strawberry.django.context import StrawberryDjangoContext
from strawberry.types.execution import ExecutionResult


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
def context(
    context_anonymous: StrawberryDjangoContext, user: User
) -> StrawberryDjangoContext:
    """GraphQL request context with an authenticated user"""
    login(
        context_anonymous.request,
        user,
        backend="django.contrib.auth.backends.ModelBackend",
    )
    return context_anonymous


def assert_graphql_result(
    result: ExecutionResult,
    expected_data: dict | None,
    expected_errors: list[str] | None = None,
) -> None:
    """Helper for asserting on GraphQL query results"""
    assert result.data == expected_data

    if expected_errors is None:
        assert result.errors is None, "Expected no errors"
    else:
        assert (
            result.errors is not None
        ), f"Expected {len(expected_errors)} error(s)"
        for error, expected_error in zip(result.errors, expected_errors):
            assert expected_error in error.message
