import pytest
from django.contrib.auth.models import User
from strawberry import relay
from strawberry.django.context import StrawberryDjangoContext

from core.schema import schema
from core.schema.query import UserNode
from core.tests.factories import UserFactory
from core.tests.schema.conftest import assert_graphql_result

pytestmark = pytest.mark.django_db

update_user_mutation = """
    mutation($input: UpdateUserInput!) {
        updateUser(input: $input) {
            id
            username
        }
    }
"""


def test_update_user_success(
    context: StrawberryDjangoContext, user: User
) -> None:
    user_id = relay.to_base64(UserNode, user.id)
    assert_graphql_result(
        schema.execute_sync(
            update_user_mutation,
            context_value=context,
            variable_values={
                "input": {"id": user_id, "username": "new_username"}
            },
        ),
        {
            "updateUser": {
                "id": user_id,
                "username": "new_username",
            }
        },
    )


@pytest.mark.skip  # TODO enable this once username validation works
@pytest.mark.parametrize(
    "username,expected",
    [
        ("", "This field cannot be blank"),
        ("a", "Invalid username"),
        ("aa", "Invalid username"),
        ("bad@", "Invalid username"),
        ("emoji bad 💀", "Invalid username"),
        (
            "too_long_too_long_too_long_too_long",
            "Invalid username",
        ),
    ],
)
def test_update_user_invalid_username(
    context: StrawberryDjangoContext, user: User, username: str, expected: str
) -> None:
    user_id = relay.to_base64(UserNode, user.id)
    assert_graphql_result(
        schema.execute_sync(
            update_user_mutation,
            context_value=context,
            variable_values={"input": {"id": user_id, "username": username}},
        ),
        None,
        [expected],
    )


def test_update_user_someone_else(context: StrawberryDjangoContext) -> None:
    other_user = UserFactory()
    other_user_id = relay.to_base64(UserNode, other_user.id)
    assert_graphql_result(
        schema.execute_sync(
            update_user_mutation,
            context_value=context,
            variable_values={
                "input": {"id": other_user_id, "username": "new_username"}
            },
        ),
        None,
        ["You don't have permission to access this app"],
    )


@pytest.mark.parametrize("user_profile__is_guest", [True])
def test_update_user_guest(
    context: StrawberryDjangoContext, user: User
) -> None:
    user_id = relay.to_base64(UserNode, user.id)
    assert_graphql_result(
        schema.execute_sync(
            update_user_mutation,
            context_value=context,
            variable_values={
                "input": {"id": user_id, "username": "new_username"}
            },
        ),
        None,
        ["You don't have permission to access this app"],
    )
