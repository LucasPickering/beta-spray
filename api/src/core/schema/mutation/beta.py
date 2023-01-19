from core.models import Beta, BetaMove
from core.schema.query import BetaNode, ProblemNode
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
        fields = {
            "problem_id": ProblemNode.get_pk_from_global_id(info, problem_id)
        }

        # Rely on default if not given
        # TODO validate name
        if name is not None:
            fields["name"] = name

        beta = Beta.objects.create(**fields)
        return cls(beta=beta)


class UpdateBetaMutation(relay.ClientIDMutation):
    class Input:
        beta_id = graphene.ID(required=True)
        name = graphene.String()

    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, beta_id, name=None):
        beta = BetaNode.get_node_from_global_id(info, beta_id)
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
        original_beta = BetaNode.get_node_from_global_id(info, beta_id)
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
        beta = BetaNode.get_node_from_global_id(info, beta_id)
        # `object.delete()` wipes out the PK field for some reason ¯\_(ツ)_/¯
        Beta.objects.filter(id=beta.id).delete()
        return cls(beta=beta)
