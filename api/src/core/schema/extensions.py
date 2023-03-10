from typing import Generator

from guest_user.functions import maybe_create_guest_user
from strawberry.extensions import Extension
from strawberry.types.graphql import OperationType


class GuestUserExtension(Extension):
    """
    Create a guest user for any mutations coming from anonymous users
    """

    def on_execute(self) -> Generator:
        if self.execution_context.operation_type == OperationType.MUTATION:
            maybe_create_guest_user(self.execution_context.context.request)
        yield
