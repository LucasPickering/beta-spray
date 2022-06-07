import graphene
from graphene import ObjectType, relay
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
import graphql_relay

from core.models import Beta, BetaMove, BodyPart, Boulder, Hold, Problem
from core import util


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
        """
        Convert a global Relay ID into a database primary key. If the global
        ID doesn't match this node's model type, raise an exception.

        This is the same as get_node_from_global_id, but it avoids any queries.
        """
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

    # TODO use this everywhere
    @classmethod
    def get_node_from_global_id(cls, info, global_id):
        """
        Get a node object based on a global ID, restricted to this class type.
        If the node exists but isn't of this type, raise an exception.
        """
        return relay.Node.get_node_from_global_id(
            info, global_id, only_type=cls
        )


class Image(ObjectType):
    """
    An image, e.g. JPG or PNG

    TODO describe SVG values
    """

    url = graphene.String(required=True)
    # Rename these two externally to be more descriptive
    width = graphene.Int(
        name="pixelWidth", required=True, description="Image width, in pixels"
    )
    height = graphene.Int(
        name="pixelHeight", required=True, description="Image height, in pixels"
    )
    svg_width = graphene.Float(
        required=True,
        description="Image width, either `100` if portrait or"
        " `width/height*100` if landscape",
    )
    svg_height = graphene.Float(
        required=True,
        description="Image width, either `100` if landscape or"
        " `height/width*100` if portrait",
    )

    def resolve_svg_width(self, info):
        return util.get_svg_dimensions(self)[0]

    def resolve_svg_height(self, info):
        return util.get_svg_dimensions(self)[1]


# TODO update all these comments
class SVGPosition(ObjectType):
    """
    A 2D position in an image, which can be expressed in two ways:
        - 0-1 in both X and Y, as a fraction of the width/height, respectively
            - This is API coordinates
        - 0-100 in the smaller dimension, and 0-(100*w/h) or 0-(100*h/w) in the
            larger dimension
            - This is SVG coordinates
            - See the Image type for a better description of this system

    Both coordinate systems use the top-left as the origin, with X increasing
    to the right and Y increasing down.
    """

    x = graphene.Float(required=True, description="X position, 0-100ish")
    y = graphene.Float(required=True, description="Y position, 0-100ish")


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
        fields = ("boulder",)
        filter_fields = []

    position = graphene.Field(SVGPosition, required=True)

    def resolve_position(self, info):
        (svg_width, svg_height) = util.get_svg_dimensions(self.boulder.image)
        return {
            "x": self.position_x * svg_width,
            "y": self.position_y * svg_height,
        }


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
        filter_fields = []
        fields = ("beta", "hold", "order")

    body_part = BodyPartType(required=True, description="Body part being moved")
    is_start = graphene.Boolean(
        required=True,
        description="Is this one of the initial moves for the beta?",
    )
    is_last_in_chain = graphene.Boolean(
        required=True,
        description="Is this the last move in the beta *for its body part*?",
    )

    @classmethod
    def get_queryset(cls, queryset, info):
        # Include is_start field. Hypothetically we could only include this if
        # it's actually requested, but the documentation for the `info` object
        # is horrendous and I don't feel like trying too hard on that.
        return queryset.annotate_is_start().annotate_is_last_in_chain()

    def resolve_is_start(self, info):
        # This is populated by annotation, so we need to resolve it explicitly
        return self.is_start

    def resolve_is_last_in_chain(self, info):
        # This is populated by annotation, so we need to resolve it explicitly
        return self.is_last_in_chain


class Query(graphene.ObjectType):
    boulders = DjangoFilterConnectionField(BoulderNode)
    boulder = relay.Node.Field(BoulderNode)
    problems = DjangoFilterConnectionField(ProblemNode)
    problem = relay.Node.Field(ProblemNode)
    beta = relay.Node.Field(BetaNode)
