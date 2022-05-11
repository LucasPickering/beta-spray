from core.util import (
    random_phrase,
    beta_name_phrase_groups,
    problem_name_phrase_groups,
)
import graphene
import uuid
from graphene import relay

from core.models import (
    Beta,
    BetaMove,
    Boulder,
    Hold,
    HoldAnnotationSource,
    Problem,
    ProblemHold,
)
from .query import (
    BoulderNode,
    HoldNode,
    ProblemNode,
    BetaNode,
    BetaMoveNode,
    BodyPartType,
)


def get_file(info, file_key):
    """Get an attached file object for a request"""
    # TODO validate file type and max size
    file = info.context.FILES.get(file_key)
    extension = file.content_type.split("/")[-1]
    # Replace file name with a UUID
    file.name = f"{uuid.uuid4()}.{extension}"
    return file


class CreateBoulderMutation(relay.ClientIDMutation):
    class Input:
        image_file = graphene.String(required=True)

    boulder = graphene.Field(BoulderNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, image_file):
        # TODO handle file missing
        # TODO validate file is an image
        file = get_file(info, image_file)
        boulder = Boulder.objects.create(image=file)

        return cls(boulder=boulder)


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


class CreateProblemMutation(relay.ClientIDMutation):
    """
    Create a new problem for a specific boulder. You can either specify an
    existing boulder, or attach a new image to create a boulder (but not both).
    """

    class Input:
        name = graphene.String()
        boulder_id = graphene.ID()
        image_file = graphene.String()

    problem = graphene.Field(ProblemNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, name=None, boulder_id=None, image_file=None
    ):
        fields = {
            # Generate a random name if not given
            "name": name
            if name is not None
            else random_phrase(problem_name_phrase_groups)
        }

        # TODO validate exactly one of boulder_id/image_file given
        if boulder_id:
            # Convert global ID to a PK
            fields["boulder_id"] = BoulderNode.get_pk_from_global_id(
                info, boulder_id
            )
        else:
            file = get_file(info, image_file)
            fields["boulder"] = Boulder.objects.create(image=file)

        problem = Problem.objects.create(**fields)
        return cls(problem=problem)


class UpdateProblemMutation(relay.ClientIDMutation):
    class Input:
        problem_id = graphene.ID(required=True)
        name = graphene.String()

    problem = graphene.Field(ProblemNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, problem_id, name):
        problem = relay.Node.get_node_from_global_id(
            info, problem_id, only_type=ProblemNode
        )
        if name is not None:
            problem.name = name
        problem.save()
        return cls(problem=problem)


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
            name if name is not None else random_phrase(beta_name_phrase_groups)
        )
        beta = Beta.objects.create(name=name, problem_id=problem_id)
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
    create_boulder = CreateBoulderMutation.Field()
    create_hold = CreateHoldMutation.Field()
    update_hold = UpdateHoldMutation.Field()
    delete_hold = DeleteHoldMutation.Field()
    create_problem = CreateProblemMutation.Field()
    update_problem = UpdateProblemMutation.Field()
    delete_problem = DeleteProblemMutation.Field()
    create_problem_hold = CreateProblemHoldMutation.Field()
    delete_problem_hold = DeleteProblemHoldMutation.Field()
    create_beta = CreateBetaMutation.Field()
    delete_beta = DeleteBetaMutation.Field()
    create_beta_move = CreateBetaMoveMutation.Field()
    update_beta_move = UpdateBetaMoveMutation.Field()
    delete_beta_move = DeleteBetaMoveMutation.Field()
