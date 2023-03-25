from enum import Enum
from typing import Optional

import rules
from django.contrib.auth.models import User

from .models import Beta, BetaMove, Hold, Problem

# NOTE: IMPORTANT!!
# For all permission checks, the object is possibly None, in which case the
# permission system is asking if the user has the permission for the entire
# type, which *supercedes* object-level permission! So generally return False
# if the object is None


class Permission(Enum):
    """
    An enum to list all the permission strings that we use. This is just to
    prevent typos in permission names, which could be very bad.
    """

    PROBLEM_EDIT = "core.edit_problem"
    PROBLEM_DELETE = "core.delete_problem"
    HOLD_CREATE = "core.create_hold"
    HOLD_EDIT = "core.edit_hold"
    HOLD_DELETE = "core.delete_hold"
    BETA_EDIT = "core.edit_beta"
    BETA_DELETE = "core.delete_beta"
    BETA_MOVE_CREATE = "core.create_betamove"
    BETA_MOVE_EDIT = "core.edit_betamove"
    BETA_MOVE_DELETE = "core.delete_betamove"


@rules.predicate
def is_owner(user: User, obj: Optional[Problem | Beta]) -> bool:
    """
    Is the user the owner of the given object? Only usable for objects that have
    explicit owners.
    """
    return obj is not None and obj.owner_id == user.id


@rules.predicate
def is_problem_owner(user: User, obj: Optional[Hold]) -> bool:
    """
    User can CUD a hold iff they own the problem
    """
    return obj is not None and is_owner(user, obj.problem)


@rules.predicate
def is_beta_owner(user: User, obj: Optional[BetaMove]) -> bool:
    """
    User can CUD a beta move iff they own the beta
    """
    return obj is not None and is_owner(user, obj.beta)


# Problem
rules.add_perm(Permission.PROBLEM_EDIT.value, is_owner)
rules.add_perm(Permission.PROBLEM_DELETE.value, is_owner)
# Beta
rules.add_perm(Permission.BETA_EDIT.value, is_owner)
rules.add_perm(Permission.BETA_DELETE.value, is_owner)
# Hold
rules.add_perm(Permission.HOLD_CREATE.value, is_problem_owner)
rules.add_perm(Permission.HOLD_EDIT.value, is_problem_owner)
rules.add_perm(Permission.HOLD_DELETE.value, is_problem_owner)
# Beta Move
rules.add_perm(Permission.BETA_MOVE_CREATE.value, is_beta_owner)
rules.add_perm(Permission.BETA_MOVE_EDIT.value, is_beta_owner)
rules.add_perm(Permission.BETA_MOVE_DELETE.value, is_beta_owner)
