from contextlib import AbstractContextManager, nullcontext

import pytest
from django.db import IntegrityError

from core.fields import BoulderPosition
from core.models import Beta, Hold
from core.tests.factories import BetaMoveFactory

pytestmark = pytest.mark.django_db


@pytest.mark.parametrize(
    "has_hold,has_position,expectation",
    [
        (False, False, pytest.raises(IntegrityError)),
        (True, False, nullcontext()),
        (True, False, nullcontext()),
        (True, True, pytest.raises(IntegrityError)),
    ],
)
def test_beta_move_hold_or_position(
    beta: Beta,
    hold: Hold,
    boulder_position: BoulderPosition,
    has_hold: bool,
    has_position: bool,
    expectation: AbstractContextManager,
) -> None:
    """
    Test both failure and success when creating a beta move with hold/position.
    Exactly one of these fields should be defined.
    """
    with expectation:
        beta_move = BetaMoveFactory(
            beta=beta,
            hold=hold if has_hold else None,
            position=boulder_position if has_position else None,
        )
        assert beta_move.hold == hold
        assert beta_move.position is None
