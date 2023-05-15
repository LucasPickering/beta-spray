from typing import Any, Callable

import strawberry
from graphql.type.definition import GraphQLResolveInfo
from strawberry.schema_directive import Location
from strawberry.utils.await_maybe import AwaitableOrValue
from strawberry_django_plus.directives import (
    SchemaDirectiveHelper,
    SchemaDirectiveWithResolver,
)

from bs_auth.models import UserProfile


@strawberry.schema_directive(
    locations=[Location.FIELD_DEFINITION],
    description="If unauthenticated, a guest user will be created for you when"
    " calling this mutation.",
)
class CreateGuestUser(SchemaDirectiveWithResolver):
    """
    A directive to create a guest user. Apply to any mutation that should
    be available to anonymous (unauthenticated) users. This will upgrade
    anonymous to guest.
    """

    def resolve(
        self,
        helper: SchemaDirectiveHelper,
        _next: Callable,
        root: Any,
        info: GraphQLResolveInfo,
        *args: Any,
        **kwargs: Any,
    ) -> AwaitableOrValue[Any]:
        UserProfile.maybe_create_guest(info.context.request)
        return _next(root, info, *args, **kwargs)
