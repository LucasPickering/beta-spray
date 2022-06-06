from core.models import Beta, BetaMove
from core.schema.query import BetaNode, ProblemNode
from core import util
from django.forms import model_to_dict
from graphene import relay
import graphene


class CreateBetaMutation(relay.ClientIDMutation):
    class Input:
        problem_id = graphene.ID(required=True)
        name = graphene.String()

    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, problem_id, name=None):
        # Convert global ID to a PK
        # TODO spit out a useful error for bad ID here
        problem_id = ProblemNode.get_pk_from_global_id(info, problem_id)
        # Generate a default name if needed
        name = (
            name
            if name is not None
            else util.random_phrase(util.beta_name_phrase_groups)
        )
        beta = Beta.objects.create(name=name, problem_id=problem_id)
        return cls(beta=beta)


class UpdateBetaMutation(relay.ClientIDMutation):
    class Input:
        beta_id = graphene.ID(required=True)
        name = graphene.String()

    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, beta_id, name):
        beta = relay.Node.get_node_from_global_id(
            info, beta_id, only_type=BetaNode
        )
        if name is not None:
            beta.name = name
        beta.save()
        return cls(beta=beta)


class CopyBetaMutation(relay.ClientIDMutation):
    class Input:
        beta_id = graphene.ID(required=True)

    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, beta_id):
        original_beta = relay.Node.get_node_from_global_id(
            info, beta_id, only_type=BetaNode
        )
        # Copy the base beta
        new_beta = Beta.objects.create(
            problem_id=original_beta.problem_id,
            name=f"{original_beta.name} 2.0",
        )
        # Copy each move
        BetaMove.objects.bulk_create(
            BetaMove(
                # This is a little jank but still better than manually copying
                # each field
                **model_to_dict(move, exclude=["id", "beta", "hold"]),
                beta_id=new_beta.id,
                # model_to_dict returns primary key in the `hold` field, so we
                # need to manually remap that field
                hold_id=move.hold_id,
            )
            for move in original_beta.moves.all()
        )
        return cls(beta=new_beta)


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
