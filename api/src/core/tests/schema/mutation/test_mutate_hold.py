from typing import cast
from unittest.mock import ANY

import pytest
import strawberry
from pytest_factoryboy import LazyFixture
from strawberry import relay
from strawberry.django.context import StrawberryDjangoContext

from core.fields import BoulderPosition
from core.models import Hold, Problem
from core.schema import schema
from core.schema.query import HoldNode, ProblemNode, SVGPosition
from core.tests.schema.conftest import assert_graphql_result

pytestmark = pytest.mark.django_db

create_hold_mutation = """
    mutation($input: CreateHoldInput!) {
        createHold(input: $input) {
            problem {
                id
            }
            position {
                x
                y
            }
            kind
            orientation
            annotation
        }
    }
"""

update_hold_mutation = """
    mutation($input: UpdateHoldInput!) {
        updateHold(input: $input) {
            id
            position {
                x
                y
            }
            kind
            orientation
            annotation
        }
    }
"""


delete_hold_mutation = """
    mutation($input: NodeInput!) {
        deleteHold(input: $input) {
            id
        }
    }
"""


def position_to_dict(
    position: BoulderPosition | None, problem: Problem
) -> dict[str, float] | None:
    if position:
        return cast(
            dict[str, float],
            strawberry.asdict(
                SVGPosition.from_boulder_position(
                    position, problem.boulder.image
                )
            ),
        )
    return None


@pytest.mark.parametrize("position", [None, BoulderPosition(x=0.5, y=0.5)])
def test_create_hold_success(
    context: StrawberryDjangoContext,
    problem: Problem,
    position: BoulderPosition | None,
) -> None:
    problem_id = relay.to_base64(ProblemNode, problem.id)
    position_dict = position_to_dict(position, problem)
    assert_graphql_result(
        schema.execute_sync(
            create_hold_mutation,
            context_value=context,
            variable_values={
                "input": {
                    "problem": problem_id,
                    "position": position_dict,
                }
            },
        ),
        {
            "createHold": {
                "problem": {"id": problem_id},
                # Random position may have been generated
                "position": position_dict if position else {"x": ANY, "y": ANY},
                "kind": None,
                "orientation": "UP",
                "annotation": "",
            }
        },
    )


@pytest.mark.parametrize("problem__owner", [LazyFixture("other_user")])
def test_create_hold_not_owner(
    context: StrawberryDjangoContext, problem: Problem
) -> None:
    problem_id = relay.to_base64(ProblemNode, problem.id)
    assert_graphql_result(
        schema.execute_sync(
            create_hold_mutation,
            context_value=context,
            variable_values={
                "input": {"problem": problem_id, "position": None}
            },
        ),
        None,
        ["You don't have permission"],
    )


def test_update_hold_success(
    context: StrawberryDjangoContext, hold: Hold
) -> None:
    hold_id = relay.to_base64(HoldNode, hold.id)
    assert_graphql_result(
        schema.execute_sync(
            update_hold_mutation,
            context_value=context,
            variable_values={
                "input": {
                    "id": hold_id,
                    "kind": "CRIMP",
                    "orientation": "LEFT",
                    "annotation": "STEVE",
                }
            },
        ),
        {
            "updateHold": {
                "id": hold_id,
                "position": position_to_dict(hold.position, hold.problem),
                "kind": "CRIMP",
                "orientation": "LEFT",
                "annotation": "STEVE",
            }
        },
    )


@pytest.mark.parametrize("problem__owner", [LazyFixture("other_user")])
def test_update_hold_not_owner(
    context: StrawberryDjangoContext, hold: Hold
) -> None:
    hold_id = relay.to_base64(HoldNode, hold.id)
    assert_graphql_result(
        schema.execute_sync(
            update_hold_mutation,
            context_value=context,
            variable_values={"input": {"id": hold_id}},
        ),
        None,
        ["You don't have permission"],
    )


def test_delete_hold_success(
    context: StrawberryDjangoContext, hold: Hold
) -> None:
    hold_id = relay.to_base64(HoldNode, hold.id)
    assert_graphql_result(
        schema.execute_sync(
            delete_hold_mutation,
            context_value=context,
            variable_values={"input": {"id": hold_id}},
        ),
        {"deleteHold": {"id": hold_id}},
    )


@pytest.mark.parametrize("problem__owner", [LazyFixture("other_user")])
def test_delete_hold_not_owner(
    context: StrawberryDjangoContext, hold: Hold
) -> None:
    hold_id = relay.to_base64(HoldNode, hold.id)
    assert_graphql_result(
        schema.execute_sync(
            delete_hold_mutation,
            context_value=context,
            variable_values={"input": {"id": hold_id}},
        ),
        None,
        ["You don't have permission"],
    )
