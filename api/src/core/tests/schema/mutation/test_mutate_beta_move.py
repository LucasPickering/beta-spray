import pytest
from pytest_factoryboy import LazyFixture
from strawberry import relay
from strawberry.django.context import StrawberryDjangoContext

from core.models import BetaMove
from core.schema import schema
from core.schema.query import BetaMoveNode
from core.tests.schema.conftest import assert_graphql_result

pytestmark = pytest.mark.django_db

create_beta_move_mutation = """
    mutation($input: CreateBetaMoveInput!) {
        createBetaMove(input: $input) {
            id
            order
            bodyPart
            isStart
            annotation
            target
            permissions {
                canEdit
                canDelete
            }
            beta {
                moves {
                    edges {
                        node {
                            id
                            order
                        }
                    }
                }
            }
        }
    }
"""

update_beta_move_mutation = """
    mutation($input: UpdateBetaMoveInput!) {
        updateBetaMove(input: $input) {
            id
            order
            bodyPart
            isStart
            annotation
            target {
                __typename
            }
            permissions {
                canEdit
                canDelete
            }
            beta {
                moves {
                    edges {
                        node {
                            id
                            order
                        }
                    }
                }
            }
        }
    }
"""

delete_beta_move_mutation = """
    mutation($input: NodeInput!) {
        deleteBetaMove(input: $input) {
            id
            beta {
                moves {
                    edges {
                        node {
                            id
                            order
                        }
                    }
                }
            }
        }
    }
"""


def test_delete_beta_move(
    context: StrawberryDjangoContext, beta_move: BetaMove
) -> None:
    beta_move_id = relay.to_base64(BetaMoveNode, beta_move.id)
    assert_graphql_result(
        schema.execute_sync(
            delete_beta_move_mutation,
            context_value=context,
            variable_values={"input": {"id": beta_move_id}},
        ),
        # This returns the *old* value
        {
            "deleteBetaMove": {
                "id": beta_move_id,
                "beta": {
                    "moves": {
                        "edges": [
                            {
                                "node": {
                                    "id": beta_move_id,
                                    "order": beta_move.order,
                                }
                            }
                        ]
                    }
                },
            }
        },
    )
    assert BetaMove.objects.filter(id=beta_move.id).count() == 0


@pytest.mark.parametrize("beta__owner", [LazyFixture("other_user")])
def test_delete_beta_move_no_permission(
    context: StrawberryDjangoContext, beta_move: BetaMove
) -> None:
    beta_move_id = relay.to_base64(BetaMoveNode, beta_move.id)
    assert_graphql_result(
        schema.execute_sync(
            delete_beta_move_mutation,
            context_value=context,
            variable_values={"input": {"id": beta_move_id}},
        ),
        None,
        ["You don't have permission"],
    )
