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


class PermissionType(Enum):
    CREATE = "create"
    EDIT = "edit"
    DELETE = "delete"


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
rules.add_perm(Problem.permission(PermissionType.EDIT), is_owner)
rules.add_perm(Problem.permission(PermissionType.DELETE), is_owner)
# Beta
rules.add_perm(Beta.permission(PermissionType.EDIT), is_owner)
rules.add_perm(Beta.permission(PermissionType.DELETE), is_owner)
# Hold
rules.add_perm(Hold.permission(PermissionType.CREATE), is_problem_owner)
rules.add_perm(Hold.permission(PermissionType.EDIT), is_problem_owner)
rules.add_perm(Hold.permission(PermissionType.DELETE), is_problem_owner)
# Beta Move
rules.add_perm(BetaMove.permission(PermissionType.CREATE), is_beta_owner)
rules.add_perm(BetaMove.permission(PermissionType.EDIT), is_beta_owner)
rules.add_perm(BetaMove.permission(PermissionType.DELETE), is_beta_owner)
