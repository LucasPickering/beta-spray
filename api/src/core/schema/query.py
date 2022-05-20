import graphene
from graphene import ObjectType, relay
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
import graphql_relay

from core.models import Beta, BetaMove, BodyPart, Boulder, Hold, Problem


# Generate a GQL enum for BodyPart
BodyPartType = graphene.Enum.from_enum(BodyPart)


class NodeType(DjangoObjectType):
    """
    Base class for all node types
    """

    class Meta:
        abstract = True

    @classmethod
    def get_pk_from_global_id(cls, info, global_id):
        # This is mostly ripped from relay.Node.get_node_from_global_id
        try:
            _type, _id = graphql_relay.from_global_id(global_id)
        except Exception as e:
            raise Exception(
                f'Unable to parse global ID "{global_id}". '
                "Make sure it is a base64 encoded string in the format: "
                f'"TypeName:id". Exception message: {str(e)}'
            )

        graphene_type = info.schema.get_type(_type)
        if graphene_type is None:
            raise Exception(f'Relay Node "{_type}" not found in schema')
        graphene_type = graphene_type.graphene_type

        # Make sure the ID's type matches this class
        assert graphene_type == cls, f"Must receive a {cls._meta.name} id."

        # We make sure the ObjectType implements the "Node" interface
        if relay.Node not in graphene_type._meta.interfaces:
            raise Exception(
                f'ObjectType "{_type}" does not implement the "{cls}" interface'
            )

        return _id


class Image(ObjectType):
    """
    An image, e.g. JPG or PNG
    """

    url = graphene.String(required=True)
    width = graphene.Int(required=True)
    height = graphene.Int(required=True)


class BoulderNode(NodeType):
    class Meta:
        model = Boulder
        interfaces = (relay.Node,)
        fields = ("holds", "problems", "created_at")
        filter_fields = []

    image = graphene.Field(Image, required=True)


class HoldNode(NodeType):
    class Meta:
        model = Hold
        interfaces = (relay.Node,)
        fields = ("boulder", "position_x", "position_y")
        filter_fields = []


class ProblemNode(NodeType):
    class Meta:
        model = Problem
        interfaces = (relay.Node,)
        fields = ("name", "created_at", "holds", "boulder", "betas")
        filter_fields = []


class BetaNode(NodeType):
    class Meta:
        model = Beta
        interfaces = (relay.Node,)
        fields = ("name", "created_at", "problem", "moves")
        filter_fields = []


class BetaMoveNode(NodeType):
    class Meta:
        model = BetaMove
        interfaces = (relay.Node,)
        fields = ("beta", "hold", "order")
        filter_fields = []

    body_part = BodyPartType(required=True)


class Query(graphene.ObjectType):
    boulders = DjangoFilterConnectionField(BoulderNode)
    boulder = relay.Node.Field(BoulderNode)
    problems = DjangoFilterConnectionField(ProblemNode)
    problem = relay.Node.Field(ProblemNode)
    beta = relay.Node.Field(BetaNode)
