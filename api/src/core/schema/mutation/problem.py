from core.models import Problem
from core.schema.query import BoulderNode, ProblemNode
from graphene import relay
import graphene


class CreateProblemMutation(relay.ClientIDMutation):
    """
    Create a new problem for a specific boulder. If not given, a name will be
    generated.
    """

    class Input:
        boulder_id = graphene.ID(required=True)
        name = graphene.String()

    problem = graphene.Field(ProblemNode, required=True)

    @classmethod
    def mutate_and_get_payload(
        cls,
        root,
        info,
        boulder_id,
        name=None,
    ):
        fields = {}

        # Rely on default if not given
        # TODO validate name
        if name is not None:
            fields["name"] = name

        # Convert global ID to a PK
        fields["boulder_id"] = BoulderNode.get_pk_from_global_id(
            info, boulder_id
        )

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
