from core.models import Beta, Boulder, Problem
from core.schema.query import BetaNode, BoulderNode, ProblemNode
from core import util
from graphene import relay
import graphene


class CreateBoulderMutation(relay.ClientIDMutation):
    class Input:
        image_file = graphene.String(required=True)

    boulder = graphene.Field(BoulderNode, required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, image_file):
        # TODO handle file missing
        # TODO validate file is an image
        file = util.get_request_file(info, image_file)
        boulder = Boulder.objects.create(image=file)

        return cls(boulder=boulder)


class CreateBoulderWithFriendsMutation(relay.ClientIDMutation):
    """
    Create a new boulder, problem, and beta together. Intended to streamline
    the process of uploading a new boulder picture for the user.

    All initial data for the new problem and beta will be automatically
    generated.
    """

    class Input:
        image_file = graphene.String(
            description="Name of the field in the HTTP body containing the"
            " boulder image data",
            required=True,
        )

    boulder = graphene.Field(BoulderNode, required=True)
    problem = graphene.Field(ProblemNode, required=True)
    beta = graphene.Field(BetaNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls,
        root,
        info,
        image_file,
    ):
        # TODO handle file missing
        # TODO validate file is an image
        file = util.get_request_file(info, image_file)

        # A nice big party!
        boulder = Boulder.objects.create(image=file)
        problem = Problem.objects.create(boulder=boulder)
        beta = Beta.objects.create(problem=problem)

        return cls(boulder=boulder, problem=problem, beta=beta)
