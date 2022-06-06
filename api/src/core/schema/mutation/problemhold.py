from core.models import HoldAnnotationSource, ProblemHold
from core.schema.query import HoldNode, ProblemNode
from graphene import relay
import graphene


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
        # TODO validate hold and problem belong to same boulder
        problem = relay.Node.get_node_from_global_id(
            info, problem_id, only_type=ProblemNode
        )
        hold = relay.Node.get_node_from_global_id(
            info, hold_id, only_type=HoldNode
        )
        ProblemHold.objects.create(
            problem=problem,
            hold=hold,
            source=HoldAnnotationSource.USER,
        )
        return cls(problem=problem, hold=hold)


class DeleteProblemHoldMutation(relay.ClientIDMutation):
    """Remove a hold from a problem"""

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
        # TODO validate hold and problem belong to same boulder
        problem = relay.Node.get_node_from_global_id(
            info, problem_id, only_type=ProblemNode
        )
        hold = relay.Node.get_node_from_global_id(
            info, hold_id, only_type=HoldNode
        )
        hold.problems.remove(problem)
        return cls(problem=problem, hold=hold)
