from core.models import Hold, HoldAnnotationSource, ProblemHold
from core.schema.mutation.position import SVGPositionInput
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
        position = graphene.Field(SVGPositionInput, required=True)
        problem_id = graphene.ID()
        annotation = graphene.String()

    hold = graphene.Field(HoldNode, required=True)
    problem = graphene.Field(ProblemNode)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, boulder_id, position, problem_id=None, annotation=None
    ):
        # We need to grab the whole boulder object so we can access the img dims
        boulder = BoulderNode.get_node_from_global_id(info, boulder_id)

        hold = Hold.objects.create(
            boulder=boulder,
            # Convert SVG position to normalized position
            position=position.to_normalized(boulder.image),
            source=HoldAnnotationSource.USER,
        )

        # TODO validate hold and problem belong to same boulder
        if problem_id:
            problem = ProblemNode.get_node_from_global_id(info, problem_id)
            ProblemHold.objects.create(
                problem=problem,
                hold=hold,
                source=HoldAnnotationSource.USER,
            )
        else:
            problem = None
        # TODO validate annotation
        if annotation is not None:
            hold.annotation = annotation

        return cls(hold=hold, problem=problem)


class UpdateHoldMutation(relay.ClientIDMutation):
    """Modify an existing hold"""

    class Input:
        hold_id = graphene.ID(required=True)
        position = graphene.Field(SVGPositionInput, required=True)
        annotation = graphene.String()

    hold = graphene.Field(HoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, hold_id, position, annotation=None
    ):
        hold = HoldNode.get_node_from_global_id(info, hold_id)
        # Convert position from SVG coords to normalized (DB) coords
        hold.position = position.to_normalized(hold.boulder.image)

        if annotation is not None:
            hold.annotation = annotation

        hold.save()
        return cls(hold=hold)


class DeleteHoldMutation(relay.ClientIDMutation):
    """Delete a hold from a boulder"""

    class Input:
        hold_id = graphene.ID(required=True)

    hold = graphene.Field(HoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, hold_id):
        hold = HoldNode.get_node_from_global_id(info, hold_id)
        Hold.objects.filter(id=hold.id).delete()
        return cls(hold=hold)
