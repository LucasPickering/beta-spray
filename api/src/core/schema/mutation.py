import graphene
import os.path
import uuid
from graphene import relay

from core.models import (
    Beta,
    BetaMove,
    BoulderImage,
    Hold,
    HoldAnnotationSource,
    Problem,
    ProblemHold,
)
from .query import (
    BoulderImageNode,
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
    root, ext = os.path.splitext(file.name)
    # Replace file name with a UUID
    file.name = f"{uuid.uuid4()}{ext}"
    return file


class CreateBoulderImageMutation(relay.ClientIDMutation):
    class Input:
        image_file = graphene.String(required=True)

    image = graphene.Field(BoulderImageNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, image_file):
        # TODO handle file missing
        # TODO validate file is an image
        file = get_file(info, image_file)
        image = BoulderImage.objects.create(image=file)

        return cls(image=image)


class CreateHoldMutation(relay.ClientIDMutation):
    """
    Add a hold to an image. Optionally, also bind the hold to a pre-existing
    problem.
    """

    class Input:
        image_id = graphene.ID(required=True)
        position_x = graphene.Float(required=True)
        position_y = graphene.Float(required=True)
        problem_id = graphene.ID()

    hold = graphene.Field(HoldNode, required=True)
    problem = graphene.Field(ProblemNode)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, image_id, position_x, position_y, problem_id
    ):
        # Convert global ID to a PK
        image_id = BoulderImageNode.get_pk_from_global_id(info, image_id)
        hold = Hold.objects.create(
            image_id=image_id,
            position_x=position_x,
            position_y=position_y,
            source=HoldAnnotationSource.USER,
        )

        # TODO validate hold and problem belong to same image
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
    """
    Create a new problem for a specific image. You can either specify an
    existing image, or attach a new one (but not both).
    """

    class Input:
        name = graphene.String(required=True)
        image_id = graphene.ID()
        image_file = graphene.String()

    problem = graphene.Field(ProblemNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls, root, info, name, image_id=None, image_file=None
    ):
        # TODO validate exactly one of image_id/image_file given

        # Convert global ID to a PK
        kwargs = {}
        if image_id:
            kwargs["image_id"] = BoulderImageNode.get_pk_from_global_id(
                info, image_id
            )
        else:
            file = get_file(info, image_file)
            kwargs["image"] = BoulderImage.objects.create(image=file)

        problem = Problem.objects.create(name=name, **kwargs)
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
        # TODO validate hold and problem belong to same image
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
        # TODO validate hold and problem belong to same image
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
        name = graphene.String(required=True)
        problem_id = graphene.ID(required=True)

    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, name, problem_id):
        # Convert global ID to a PK
        # TODO spit out a useful error for bad ID here
        problem_id = ProblemNode.get_pk_from_global_id(info, problem_id)
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
    create_image = CreateBoulderImageMutation.Field()
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
