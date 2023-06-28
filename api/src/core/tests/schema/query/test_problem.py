import pytest
from django.contrib.auth.models import User
from strawberry.django.context import StrawberryDjangoContext
from strawberry_django_plus import relay

from core.models import Problem, Visibility
from core.schema import schema
from core.schema.query import ProblemNode
from core.tests.factories import BoulderFactory, ProblemFactory, UserFactory
from core.tests.schema.conftest import assert_graphql_result

# TODO is there a way to move this into conftest.py?
pytestmark = pytest.mark.django_db

problem_query = """
    query($problemId: ID!) {
        problem(id: $problemId) {
            id
            name
            boulder {
                image {
                    url
                }
            }
        }
    }
"""


problems_query = """
    query($isMine: Boolean, $visibility: Visibility) {
        problems(isMine: $isMine, visibility: $visibility) {
            totalCount
            edges {
                node {
                    id
                    name
                }
            }
        }
    }
"""


@pytest.mark.parametrize(
    "problem_id",
    [
        "QmV0YU5vZGU6ODQ=",  # ID with wrong type
        "UHJvYmxlbU5vZGU6NDE=",  # ID with correct type but unknown primary key
    ],
)
def test_query_problem_null(problem_id: str) -> None:
    assert_graphql_result(
        schema.execute_sync(
            problem_query, variable_values={"problemId": problem_id}
        ),
        {"problem": None},
    )


@pytest.mark.parametrize(
    "problem_id,expected",
    [
        ("unknown", "invalid value 'unknown'"),  # Invalid base64
        ("dW5rbm93bg==", "expected to contain only 2 items"),  # meaningless b64
    ],
)
def test_query_problem_invalid_id(problem_id: str, expected: str) -> None:
    assert_graphql_result(
        schema.execute_sync(
            problem_query, variable_values={"problemId": problem_id}
        ),
        None,
        [expected],
    )


@pytest.mark.parametrize(
    "problem__visibility", [Visibility.PUBLIC, Visibility.UNLISTED]
)
def test_query_problem_success(problem: Problem) -> None:
    problem_id = relay.to_base64(ProblemNode, problem.id)
    assert_graphql_result(
        schema.execute_sync(
            problem_query, variable_values={"problemId": problem_id}
        ),
        {
            "problem": {
                "id": problem_id,
                "name": problem.name,
                "boulder": {"image": {"url": problem.boulder.image.url}},
            }
        },
    )


def test_query_problems(context: StrawberryDjangoContext, user: User) -> None:
    other_user = UserFactory()
    boulder1 = BoulderFactory()
    boulder2 = BoulderFactory()
    problem_mine_public = ProblemFactory(
        boulder=boulder1, owner=user, visibility=Visibility.PUBLIC
    )
    problem_mine_unlisted = ProblemFactory(
        boulder=boulder2, owner=user, visibility=Visibility.UNLISTED
    )
    problem_other_public = ProblemFactory(
        boulder=boulder1, owner=other_user, visibility=Visibility.PUBLIC
    )
    # This will never show up in query output
    ProblemFactory(
        boulder=boulder2, owner=other_user, visibility=Visibility.UNLISTED
    )

    def get_result(*problems: Problem) -> dict:
        return {
            "problems": {
                "totalCount": len(problems),
                "edges": [
                    {
                        "node": {
                            "id": relay.to_base64(ProblemNode, problem.id),
                            "name": problem.name,
                        }
                    }
                    for problem in problems
                ],
            }
        }

    # We expect output to always be sorted by newest->oldest

    # Get all visible problems: mine OR public
    assert_graphql_result(
        schema.execute_sync(problems_query, context_value=context),
        get_result(
            problem_other_public, problem_mine_unlisted, problem_mine_public
        ),
    )

    # Get all of my problems
    assert_graphql_result(
        schema.execute_sync(
            problems_query,
            context_value=context,
            variable_values={"isMine": True},
        ),
        get_result(problem_mine_unlisted, problem_mine_public),
    )

    # Get all public problems
    assert_graphql_result(
        schema.execute_sync(
            problems_query,
            context_value=context,
            variable_values={"visibility": "PUBLIC"},
        ),
        get_result(problem_other_public, problem_mine_public),
    )

    # Get *my* public problems
    assert_graphql_result(
        schema.execute_sync(
            problems_query,
            context_value=context,
            variable_values={"visibility": "PUBLIC", "isMine": True},
        ),
        get_result(problem_mine_public),
    )

    # Get all unlisted problems - implicitly filters by isMine
    assert_graphql_result(
        schema.execute_sync(
            problems_query,
            context_value=context,
            variable_values={"visibility": "UNLISTED"},
        ),
        get_result(problem_mine_unlisted),
    )
