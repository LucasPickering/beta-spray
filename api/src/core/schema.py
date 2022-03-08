import graphene
import os.path
import uuid
from graphene import relay
from graphene_django import DjangoObjectType
from graphene_django.filter import DjangoFilterConnectionField
import graphql_relay

from core.models import Beta, BetaMove, BodyPart, BoulderImage, Hold, Problem


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
        fields = ("holds", "problems", "created_at")
        filter_fields = []

    image_url = graphene.String(required=True)

    def resolve_image_url(self, info):
        return self.image.url


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


class BetaMoveNode(NodeType):
    class Meta:
        model = BetaMove
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
        fields = ("problem", "moves")
        filter_fields = []


class Query(graphene.ObjectType):
    images = DjangoFilterConnectionField(BoulderImageNode)
    image = relay.Node.Field(BoulderImageNode)
    problem = relay.Node.Field(ProblemNode)
    beta = relay.Node.Field(BetaNode)


# ========== MUTATIONS ==========


class CreateBoulderImageMutation(relay.ClientIDMutation):
    class Input:
        image_file = graphene.String(required=True)

    image = graphene.Field(BoulderImageNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, image_file):
        # TODO handle file missing
        # TODO validate file is an image
        file = info.context.FILES.get(image_file)
        root, ext = os.path.splitext(file.name)
        # Replace file name with a UUID
        file.name = f"{uuid.uuid4()}{ext}"
        image_object = BoulderImage.objects.create(image=file)

        return cls(image=image_object)


class CreateHoldMutation(relay.ClientIDMutation):
    """Add a hold to an image"""

    class Input:
        image_id = graphene.ID(required=True)
        position_x = graphene.Float(required=True)
        position_y = graphene.Float(required=True)

    hold = graphene.Field(HoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, image_id, position_x, position_y
    ):
        # Convert global ID to a PK
        image_id = BoulderImageNode.get_pk_from_global_id(info, image_id)
        hold = Hold.objects.create(
            image_id=image_id, position_x=position_x, position_y=position_y
        )
        return cls(hold=hold)


class DeleteHoldMutation(relay.ClientIDMutation):
    """Delete a hold from an image"""

    class Input:
        hold_id = graphene.ID(required=True)

    hold = graphene.Field(HoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, hold_id):
        hold = relay.Node.get_node_from_global_id(
            info, hold_id, only_type=HoldNode
        )
        Hold.objects.filter(id=hold.id).delete()
        return cls(hold=hold)


class CreateProblemMutation(relay.ClientIDMutation):
    """Create a new problem for a specific image"""

    class Input:
        image_id = graphene.ID(required=True)

    problem = graphene.Field(ProblemNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, image_id):
        # Convert global ID to a PK
        image_id = BoulderImageNode.get_pk_from_global_id(info, image_id)
        problem = Problem.objects.create(image_id=image_id)
        return cls(problem=problem)


class CreateProblemHoldMutation(relay.ClientIDMutation):
    """Add a hold to a problem"""

    class Input:
        problem_id = graphene.ID(required=True)
        hold_id = graphene.ID(required=True)

    problem = graphene.Field(ProblemNode, required=True)
    hold = graphene.Field(HoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls,
        root,
        info,
        problem_id,
        hold_id,
    ):
        # Convert global ID to a PK
        # TODO validate hold and problem belong to same image
        problem = relay.Node.get_node_from_global_id(
            info, problem_id, only_type=ProblemNode
        )
        hold = relay.Node.get_node_from_global_id(
            info, hold_id, only_type=HoldNode
        )
        hold.problems.create(problem=problem)
        return cls(problem=problem, hold=hold)


class DeleteProblemMutation(relay.ClientIDMutation):
    class Input:
        problem_id = graphene.ID(required=True)

    problem = graphene.Field(ProblemNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, problem_id):
        problem = relay.Node.get_node_from_global_id(
            info, problem_id, only_type=ProblemNode
        )
        Problem.objects.filter(id=problem.id).delete()
        return cls(problem=problem)


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
        # `object.delete()` wipes out the PK field for some reason ¯\_(ツ)_/¯
        Beta.objects.filter(id=beta.id).delete()
        return cls(beta=beta)


class CreateBetaMoveMutation(relay.ClientIDMutation):
    """
    Add a new move to an existing beta. A move can optionally be associated with
    a hold. Some moves (flagging, smearing, etc.) do not need an associated hold
    though.

    If a move already exists for the given order+beta combo, the new move will
    be given the requested order, and every other move in the beta will "slide
    down", e.g. if the new move is `order=3`, then the existing move #3 will
    become #4, #4 will become #5, etc.

    If no order is given, the move will be appended to the end.
    """

    class Input:
        beta_id = graphene.ID(required=True)
        body_part = BodyPartType(required=True)
        order = graphene.Int()
        hold_id = graphene.ID()

    beta_move = graphene.Field(BetaMoveNode, required=True)
    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls,
        root,
        info,
        beta_id,
        body_part,
        order=None,
        hold_id=None,
    ):
        # Convert GQL IDs to PKs
        beta_id = BetaNode.get_pk_from_global_id(info, beta_id)
        hold_id = hold_id and HoldNode.get_pk_from_global_id(info, hold_id)

        # TODO validate that hold and beta belong to the same problem
        # TODO handle if new order value is too high
        beta_move = BetaMove.objects.add_to_beta(
            beta_id=beta_id, order=order, body_part=body_part, hold_id=hold_id
        )

        return cls(beta_move=beta_move)


class UpdateBetaMoveMutation(relay.ClientIDMutation):
    class Input:
        beta_move_id = graphene.ID(required=True)
        order = graphene.Int()
        hold_id = graphene.ID()

    beta_move = graphene.Field(BetaMoveNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, beta_move_id, order=None, hold_id=None
    ):
        beta_move_id = BetaMoveNode.get_pk_from_global_id(info, beta_move_id)
        hold_id = hold_id and HoldNode.get_pk_from_global_id(info, hold_id)
        beta_move = BetaMove.objects.update_in_beta(
            beta_move_id=beta_move_id, order=order, hold_id=hold_id
        )
        return cls(beta_move=beta_move)


class DeleteBetaMoveMutation(relay.ClientIDMutation):
    class Input:
        beta_move_id = graphene.ID(required=True)

    beta_move = graphene.Field(BetaMoveNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, beta_move_id):
        beta_move_id = BetaMoveNode.get_pk_from_global_id(info, beta_move_id)
        beta_move = BetaMove.objects.delete_from_beta(beta_move_id=beta_move_id)
        return cls(beta_move=beta_move)


class Mutation(graphene.ObjectType):
    create_image = CreateBoulderImageMutation.Field()
    create_hold = CreateHoldMutation.Field()
    delete_hold = DeleteHoldMutation.Field()
    create_problem = CreateProblemMutation.Field()
    create_problem_hold = CreateProblemHoldMutation.Field()
    delete_problem = DeleteProblemMutation.Field()
    create_beta = CreateBetaMutation.Field()
    delete_beta = DeleteBetaMutation.Field()
    create_beta_move = CreateBetaMoveMutation.Field()
    update_beta_move = UpdateBetaMoveMutation.Field()
    delete_beta_move = DeleteBetaMoveMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
