from enum import Enum
from typing import Optional

import rules
from django.contrib.auth.models import User
from django.db.models import Model

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


def permission(model: Model, permission_type: PermissionType) -> str:
    """
    Get a string representing a permission for a model type. The name
    consists of the app name, model name, and name of the action being
    performed. This should be used any time permissions are referenced, to
    ensure consistency.
    """
    meta = model._meta
    return f"{meta.app_label}.{permission_type.value}_{meta.model_name}"


@rules.predicate
def is_current_user(user: User, obj: Optional[User]) -> bool:
    """It me?"""
    return obj is not None and user == obj


@rules.predicate
def is_resident_user(user: User) -> bool:
    """Is the user *not* a guest?"""
    return not user.profile.is_guest


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


# User
rules.add_perm(
    permission(User, PermissionType.EDIT),
    # Guest users can't be edited at all
    is_current_user & is_resident_user,
)
rules.add_perm(permission(User, PermissionType.DELETE), False)
# Problem
rules.add_perm(permission(Problem, PermissionType.EDIT), is_owner)
rules.add_perm(permission(Problem, PermissionType.DELETE), is_owner)
# Beta
rules.add_perm(permission(Beta, PermissionType.EDIT), is_owner)
rules.add_perm(permission(Beta, PermissionType.DELETE), is_owner)
# Hold
rules.add_perm(permission(Hold, PermissionType.CREATE), is_problem_owner)
rules.add_perm(permission(Hold, PermissionType.EDIT), is_problem_owner)
rules.add_perm(permission(Hold, PermissionType.DELETE), is_problem_owner)
# Beta Move
rules.add_perm(permission(BetaMove, PermissionType.CREATE), is_beta_owner)
rules.add_perm(permission(BetaMove, PermissionType.EDIT), is_beta_owner)
rules.add_perm(permission(BetaMove, PermissionType.DELETE), is_beta_owner)
