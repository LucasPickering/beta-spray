import strawberry
from graphql import GraphQLID
from strawberry import relay
from strawberry.custom_scalar import ScalarDefinition
from strawberry.schema.types.scalar import DEFAULT_SCALAR_REGISTRY
from strawberry_django.optimizer import DjangoOptimizerExtension

from .mutation import Mutation
from .query import Query

# https://github.com/blb-ventures/strawberry-django-plus/issues/166#issuecomment-1414420627
# Sets the name from GlobalID! to ID!
DEFAULT_SCALAR_REGISTRY[relay.GlobalID] = ScalarDefinition(
    # Use the same name/description/parse_literal from GraphQLID as relay
    # specs expect this type to be "ID".
    name="ID",
    description=GraphQLID.description,
    parse_literal=lambda v, vars=None: relay.GlobalID.from_id(
        GraphQLID.parse_literal(v, vars)
    ),
    parse_value=relay.GlobalID.from_id,
    serialize=str,
    specified_by_url="https://relay.dev/graphql/objectidentification.html",
)

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[DjangoOptimizerExtension],
)
