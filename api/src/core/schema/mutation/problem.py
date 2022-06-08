from core.models import Boulder, Problem
from core.schema.query import BoulderNode, ProblemNode
from core import util
from graphene import relay
import graphene


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
            else util.random_phrase(util.problem_name_phrase_groups)
        }

        # TODO validate exactly one of boulder_id/image_file given
        if boulder_id:
            # Convert global ID to a PK
            fields["boulder_id"] = BoulderNode.get_pk_from_global_id(
                info, boulder_id
            )
        else:
            file = util.get_request_file(info, image_file)
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
        problem = ProblemNode.get_node_from_global_id(info, problem_id)
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
        problem = ProblemNode.get_node_from_global_id(info, problem_id)
        Problem.objects.filter(id=problem.id).delete()
        return cls(problem=problem)
