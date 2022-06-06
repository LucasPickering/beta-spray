from core.models import Hold, HoldAnnotationSource, ProblemHold
from core.schema.query import BoulderNode, HoldNode, ProblemNode
from graphene import relay
import graphene


class CreateHoldMutation(relay.ClientIDMutation):
    """
    Add a hold to a boulder. Optionally, also bind the hold to a pre-existing
    problem.
    """

    class Input:
        boulder_id = graphene.ID(required=True)
        position_x = graphene.Float(required=True)
        position_y = graphene.Float(required=True)
        problem_id = graphene.ID()

    hold = graphene.Field(HoldNode, required=True)
    problem = graphene.Field(ProblemNode)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, boulder_id, position_x, position_y, problem_id
    ):
        # Convert global ID to a PK
        boulder_id = BoulderNode.get_pk_from_global_id(info, boulder_id)
        hold = Hold.objects.create(
            boulder_id=boulder_id,
            position_x=position_x,
            position_y=position_y,
            source=HoldAnnotationSource.USER,
        )

        # TODO validate hold and problem belong to same boulder
        if problem_id:
            problem = relay.Node.get_node_from_global_id(
                info, problem_id, only_type=ProblemNode
            )
            ProblemHold.objects.create(
                problem=problem,
                hold=hold,
                source=HoldAnnotationSource.USER,
            )
        else:
            problem = None

        return cls(hold=hold, problem=problem)


class UpdateHoldMutation(relay.ClientIDMutation):
    """Modify an existing hold"""

    class Input:
        hold_id = graphene.ID(required=True)
        position_x = graphene.Float()
        position_y = graphene.Float()

    hold = graphene.Field(HoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, hold_id, position_x, position_y
    ):
        hold = relay.Node.get_node_from_global_id(
            info, hold_id, only_type=HoldNode
        )
        if position_x is not None:
            hold.position_x = position_x
        if position_y is not None:
            hold.position_y = position_y
        hold.save()
        return cls(hold=hold)


class DeleteHoldMutation(relay.ClientIDMutation):
    """Delete a hold from a boulder"""

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
