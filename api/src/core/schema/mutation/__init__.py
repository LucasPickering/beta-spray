from core.schema.mutation.beta import (
    CopyBetaMutation,
    CreateBetaMutation,
    DeleteBetaMutation,
    UpdateBetaMutation,
)
from core.schema.mutation.betamove import (
    CreateBetaMoveMutation,
    DeleteBetaMoveMutation,
    UpdateBetaMoveMutation,
)
from core.schema.mutation.boulder import CreateBoulderMutation
from core.schema.mutation.hold import (
    CreateHoldMutation,
    DeleteHoldMutation,
    UpdateHoldMutation,
)
from core.schema.mutation.problem import (
    CreateProblemMutation,
    DeleteProblemMutation,
    UpdateProblemMutation,
)
from core.schema.mutation.problemhold import (
    CreateProblemHoldMutation,
    DeleteProblemHoldMutation,
)
import graphene


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
    update_beta = UpdateBetaMutation.Field()
    copy_beta = CopyBetaMutation.Field()
    delete_beta = DeleteBetaMutation.Field()
    create_beta_move = CreateBetaMoveMutation.Field()
    update_beta_move = UpdateBetaMoveMutation.Field()
    delete_beta_move = DeleteBetaMoveMutation.Field()
