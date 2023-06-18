import pytest
from strawberry.django.context import StrawberryDjangoContext

from core.schema import schema

# TODO is there a way to move this into conftest.py?
pytestmark = pytest.mark.django_db


def test_query_current_user_anonymous(
    context_anonymous: StrawberryDjangoContext,
) -> None:
    query = """
        query {
            currentUser {
                __typename
            }
        }
    """

    result = schema.execute_sync(query, context_value=context_anonymous)
    assert result.data == {"currentUser": {"__typename": "NoUser"}}
    assert result.errors is None


def test_query_current_user_guest(
    context_guest: StrawberryDjangoContext,
) -> None:
    query = """
        query {
            currentUser {
                __typename
                ... on UserNode {
                    isGuest
                }
            }
        }
    """

    result = schema.execute_sync(query, context_value=context_guest)
    assert result.data == {
        "currentUser": {"__typename": "UserNode", "isGuest": True}
    }
    assert result.errors is None


def test_query_current_user_resident(
    context_resident: StrawberryDjangoContext,
) -> None:
    query = """
        query {
            currentUser {
                __typename
                ... on UserNode {
                    isGuest
                }
            }
        }
    """

    result = schema.execute_sync(query, context_value=context_resident)
    assert result.data == {
        "currentUser": {"__typename": "UserNode", "isGuest": False}
    }
    assert result.errors is None
