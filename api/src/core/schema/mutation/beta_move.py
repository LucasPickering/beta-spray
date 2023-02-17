from core.models import BetaMove
from core.schema.mutation.position import SVGPositionInput
from core.schema.query import BetaMoveNode, BetaNode, BodyPartType, HoldNode
from graphene import relay
import graphene
from graphql import GraphQLError


class CreateBetaMoveMutation(relay.ClientIDMutation):
    """
    Add a new move to a beta. The move can either be appended to the end, or
    inserted in the middle (by specifying a previous_beta_move_id).
    """

    class Input:
        beta_id = graphene.ID(required=True)
        body_part = BodyPartType(required=True)
        hold_id = graphene.ID(
            description="Hold to connect the move to."
            " Mutually exclusive with `position`.",
        )
        position = graphene.Field(
            SVGPositionInput,
            description="Position of the move, for free moves."
            " Mutually exclusive with `hold_id`.",
        )
        previous_beta_move_id = graphene.ID(
            description="Move *preceding* this one in the beta."
            " Null to add to the end."
        )

    beta_move = graphene.Field(BetaMoveNode, required=True)
    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls,
        root,
        info,
        beta_id,
        body_part,
        hold_id=None,
        position=None,
        previous_beta_move_id=None,
    ):
        # Convert GQL IDs to PKs
        beta = BetaNode.get_node_from_global_id(info, beta_id)
        hold_id = hold_id and HoldNode.get_pk_from_global_id(info, hold_id)
        normalized_position = position and position.to_normalized(
            beta.problem.boulder.image
        )

        previous_move = (
            BetaMoveNode.get_node_from_global_id(info, previous_beta_move_id)
            if previous_beta_move_id
            else None
        )

        # TODO better validation error (include path)
        if previous_move is not None and previous_move.beta_id != beta.id:
            return GraphQLError("Previous move must belong to the given beta")

        # TODO validate that hold and beta belong to the same problem
        created = BetaMove.objects.create(
            beta=beta,
            body_part=body_part,
            hold_id=hold_id,
            position=normalized_position,
            order=previous_move.order + 1 if previous_move else None,
        )
        # We need to re-fetch the created row to populate annotated fields
        beta_move = BetaMove.objects.annotate_all().get(id=created.id)

        return cls(beta=beta, beta_move=beta_move)


class UpdateBetaMoveMutation(relay.ClientIDMutation):
    class Input:
        beta_move_id = graphene.ID(required=True)
        order = graphene.Int()
        hold_id = graphene.ID(
            description="Hold to connect the move to."
            " Mutually exclusive with `position`.",
        )
        position = graphene.Field(
            SVGPositionInput,
            description="Position of the move, for free moves."
            " Mutually exclusive with `hold_id`.",
        )
        annotation = graphene.String()

    beta_move = graphene.Field(BetaMoveNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls,
        root,
        info,
        beta_move_id,
        order=None,
        hold_id=None,
        position=None,
        annotation=None,
    ):
        beta_move_id = BetaMoveNode.get_pk_from_global_id(info, beta_move_id)
        hold_id = hold_id and HoldNode.get_pk_from_global_id(info, hold_id)
        # WARNING: we have to use .save() here instead of .update(), so that
        # the pre_save trigger gets called and the surrouding moves get slidded
        # around properly to make room for the new order (if any)
        beta_move = BetaMove.objects.get(id=beta_move_id)
        # TODO validate new order is in range
        if order is not None:
            beta_move.order = order
        # TODO validate hold and beta belong to same problem
        # TODO validate exactly one of hold_id/position is defined
        if hold_id is not None:
            beta_move.hold_id = hold_id
            beta_move.position = None
        if position is not None:
            beta_move.hold_id = None
            beta_move.position = position.to_normalized(
                beta_move.beta.problem.boulder.image
            )
        if annotation is not None:
            # TODO validate length
            beta_move.annotation = annotation
        beta_move.save()

        return cls(beta_move=beta_move)


class DeleteBetaMoveMutation(relay.ClientIDMutation):
    class Input:
        beta_move_id = graphene.ID(required=True)

    beta_move = graphene.Field(BetaMoveNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, beta_move_id):
        beta_move_id = BetaMoveNode.get_pk_from_global_id(info, beta_move_id)
        beta_move = BetaMove.objects.get(id=beta_move_id)
        # `object.delete()` wipes out the PK field for some reason ¯\_(ツ)_/¯
        BetaMove.objects.filter(id=beta_move.id).delete()
        return cls(beta_move=beta_move)
