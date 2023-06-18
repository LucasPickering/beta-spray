import pytest
from strawberry.django.context import StrawberryDjangoContext

from core.schema import schema
from core.tests.schema.conftest import assert_graphql_result

pytestmark = pytest.mark.django_db

current_user_query = """
    query {
        currentUser {
            __typename
            ... on UserNode {
                isGuest
            }
        }
    }
"""


def test_query_current_user_anonymous(
    context_anonymous: StrawberryDjangoContext,
) -> None:
    assert_graphql_result(
        schema.execute_sync(
            current_user_query, context_value=context_anonymous
        ),
        {"currentUser": {"__typename": "NoUser"}},
    )


@pytest.mark.parametrize("user_profile__is_guest", [True])
def test_query_current_user_guest(context: StrawberryDjangoContext) -> None:
    assert_graphql_result(
        schema.execute_sync(current_user_query, context_value=context),
        {"currentUser": {"__typename": "UserNode", "isGuest": True}},
    )


def test_query_current_user_resident(
    context: StrawberryDjangoContext,
) -> None:
    assert_graphql_result(
        schema.execute_sync(current_user_query, context_value=context),
        {"currentUser": {"__typename": "UserNode", "isGuest": False}},
    )
