import graphene
from graphene import relay
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
import graphql_relay

from core.models import Beta, BetaHold, BodyPart, BoulderImage, Hold, Problem


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


class BoulderImageNode(NodeType):
    class Meta:
        model = BoulderImage
        interfaces = (relay.Node,)
        fields = ("path", "holds", "problems")
        filter_fields = []


class HoldNode(NodeType):
    class Meta:
        model = Hold
        interfaces = (relay.Node,)
        fields = ("image", "position_x", "position_y")
        filter_fields = []


class ProblemNode(NodeType):
    class Meta:
        model = Problem
        interfaces = (relay.Node,)
        fields = ("holds", "image", "betas")
        filter_fields = []


class BetaHoldNode(NodeType):
    class Meta:
        model = BetaHold
        interfaces = (relay.Node,)
        fields = (
            "beta",
            "hold",
            "order",
        )
        filter_fields = []

    body_part = BodyPartType(required=True)

    @classmethod
    def get_queryset(cls, queryset, info):
        return queryset.order_by("order")


class BetaNode(NodeType):
    class Meta:
        model = Beta
        interfaces = (relay.Node,)
        fields = ("problem",)
        filter_fields = []

    holds = DjangoFilterConnectionField(BetaHoldNode, required=True)

    def resolve_holds(self, info, **kwargs):
        return self.betahold_set


class Query(graphene.ObjectType):
    images = DjangoFilterConnectionField(BoulderImageNode)
    image = relay.Node.Field(BoulderImageNode)
    problem = relay.Node.Field(ProblemNode)
    beta = relay.Node.Field(BetaNode)


# ========== MUTATIONS ==========


class CreateBetaMutation(relay.ClientIDMutation):
    class Input:
        problem_id = graphene.ID(required=True)

    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, problem_id):
        # Convert global ID to a PK
        # TODO spit out a useful error for bad ID here
        problem_id = ProblemNode.get_pk_from_global_id(info, problem_id)
        beta = Beta.objects.create(problem_id=problem_id)
        return cls(beta=beta)


class DeleteBetaMutation(relay.ClientIDMutation):
    class Input:
        beta_id = graphene.ID(required=True)

    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, beta_id):
        beta = relay.Node.get_node_from_global_id(
            info, beta_id, only_type=BetaNode
        )
        beta.delete()
        return cls(beta=beta)


class CreateBetaHoldMutation(relay.ClientIDMutation):
    class Input:
        beta_id = graphene.ID(required=True)
        hold_id = graphene.ID(required=True)
        body_part = BodyPartType(required=True)
        order = graphene.Int()

    # TODO add BetaHoldNode
    beta_hold = graphene.Field(BetaHoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, beta_id, hold_id, body_part, order
    ):
        # Convert GQL IDs to PKs
        beta_id = BetaNode.get_pk_from_global_id(info, beta_id)
        hold_id = HoldNode.get_pk_from_global_id(info, hold_id)

        beta_hold = BetaHold.objects.create(
            beta_id=beta_id, hold_id=hold_id, body_part=body_part, order=order
        )

        return cls(beta_hold=beta_hold)


class DeleteBetaHoldMutation(relay.ClientIDMutation):
    class Input:
        beta_hold_id = graphene.ID(required=True)

    beta_hold = graphene.Field(BetaHoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, beta_hold_id):
        beta_hold = relay.Node.get_node_from_global_id(
            info, beta_hold_id, only_type=BetaHoldNode
        )
        beta_hold.delete()
        return cls(beta_hold=beta_hold)


class Mutation(graphene.ObjectType):
    create_beta = CreateBetaMutation.Field()
    delete_beta = DeleteBetaMutation.Field()
    create_beta_hold = CreateBetaHoldMutation.Field()
    delete_beta_hold = DeleteBetaHoldMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
