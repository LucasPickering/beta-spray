from core import util
from core.models import Hold, HoldAnnotationSource, ProblemHold
from core.schema.query import BoulderNode, HoldNode, ProblemNode
from graphene import relay
import graphene


class SVGPositionInput(graphene.InputObjectType):
    x = graphene.Float(required=True, description="X position, 0-100ish")
    y = graphene.Float(required=True, description="Y position, 0-100ish")

    def to_normalized(self, image):
        """
        TODO
        """
        (svg_width, svg_height) = util.get_svg_dimensions(image)
        return (self.x / svg_width, self.y / svg_height)


class CreateHoldMutation(relay.ClientIDMutation):
    """
    Add a hold to a boulder. Optionally, also bind the hold to a pre-existing
    problem.
    """

    class Input:
        boulder_id = graphene.ID(required=True)
        position = graphene.Field(SVGPositionInput, required=True)
        problem_id = graphene.ID()

    hold = graphene.Field(HoldNode, required=True)
    problem = graphene.Field(ProblemNode)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, boulder_id, position, problem_id
    ):
        # We need to grab the whole boulder object so we can access the img dims
        boulder = BoulderNode.get_node_from_global_id(info, boulder_id)

        # Convert SVG position to normalized position
        (position_x, position_y) = position.to_normalized(boulder.image)

        hold = Hold.objects.create(
            boulder=boulder,
            position_x=position_x,
            position_y=position_y,
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

        return cls(hold=hold, problem=problem)


class RelocateHoldMutation(relay.ClientIDMutation):
    """Change the position of an existing hold"""

    class Input:
        hold_id = graphene.ID(required=True)
        position = graphene.Field(SVGPositionInput, required=True)

    hold = graphene.Field(HoldNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, hold_id, position):
        hold = HoldNode.get_node_from_global_id(info, hold_id)
        # Convert position from SVG coords to normalized (DB) coords
        (position_x, position_y) = position.to_normalized(hold.boulder.image)
        hold.position_x = position_x
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
        hold = HoldNode.get_node_from_global_id(info, hold_id)
        Hold.objects.filter(id=hold.id).delete()
        return cls(hold=hold)
