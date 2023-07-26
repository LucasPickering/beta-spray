from typing import Any, Callable

import strawberry
from strawberry.extensions import FieldExtension
from strawberry.schema_directive import Location
from strawberry.types import Info

from bs_auth.models import UserProfile


@strawberry.schema_directive(
    locations=[Location.FIELD_DEFINITION],
    description="If unauthenticated, a guest user will be created for you when"
    " calling this mutation.",
)
class CreateGuestUser(FieldExtension):
    """
    A directive to create a guest user. Apply to any mutation that should
    be available to anonymous (unauthenticated) users. This will upgrade
    anonymous to guest.
    """

    def resolve(
        self,
        next_: Callable[..., Any],
        source: Any,
        info: Info[Any, Any],
        **kwargs: Any,
    ) -> Any:
        UserProfile.maybe_create_guest(info.context.request)
        return next_(source, info, **kwargs)
