from core.models import BetaMove
from core.schema.query import BetaMoveNode, BetaNode, BodyPartType, HoldNode
from graphene import relay
import graphene


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
        # TODO validate new order (take logic from commit cfd112a, query.py)
        beta_move = BetaMove.objects.create(
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
        # WARNING: we have to use .save() here instead of .update(), so that
        # the pre_save trigger gets called and the surrouding moves get slidded
        # around properly to make room for the new order (if any)
        beta_move = BetaMove.objects.get(id=beta_move_id)
        if order is not None:
            beta_move.order = order
        if hold_id is not None:
            beta_move.hold_id = hold_id
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
