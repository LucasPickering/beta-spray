import random
from typing import Annotated, NewType, Optional

import strawberry
import strawberry.django
from django.contrib.auth import logout
from django.contrib.auth.models import User
from django.forms import ValidationError
from strawberry import relay
from strawberry.field_extensions import InputMutationExtension
from strawberry.types.info import Info
from strawberry_django import mutations
from strawberry_django.mutations import resolvers
from strawberry_django.permissions import HasRetvalPerm

from .. import util
from ..directives import CreateGuestUser
from ..fields import BoulderPosition
from ..models import (
    Beta,
    BetaMove,
    BodyPart,
    Boulder,
    Hold,
    HoldAnnotationSource,
    Problem,
    Visibility,
)
from ..permissions import PermissionType, permission
from .query import (
    BetaMoveNode,
    BetaNode,
    HoldNode,
    Image,
    ProblemNode,
    UserNode,
)

ImageUpload = strawberry.scalar(
    NewType("ImageUpload", bytes),
    description="An uploaded image. To upload a file, see: "
    # Shout out to flake8, really stellar formatting here (:
    "https://strawberry.rocks/docs/guides/file-upload"
    "#sending-file-upload-requests",
    serialize=lambda v: v,
    parse_value=util.clean_input_file,
)


@strawberry.input
class SVGPositionInput:
    x: float = strawberry.field(description="X position, 0-100ish")
    y: float = strawberry.field(description="Y position, 0-100ish")

    def to_normalized(self, image: Image) -> BoulderPosition:
        """
        Normalize a position, such that the x/y values are both [0,1] rather
        than based on the SVG dimensions.
        """
        (svg_width, svg_height) = util.get_svg_dimensions(image)
        return BoulderPosition(self.x / svg_width, self.y / svg_height)


@strawberry.django.partial(User)
class UpdateUserInput(strawberry.django.NodeInput):
    id: relay.GlobalID
    # TODO validate username
    username: strawberry.auto


@strawberry.django.partial(Problem)
class UpdateProblemInput(strawberry.django.NodeInput):
    name: strawberry.auto
    external_link: strawberry.auto
    visibility: Optional[Visibility]


@strawberry.django.input(Beta)
class CreateBetaInput:
    problem: relay.GlobalID


@strawberry.django.partial(Beta)
class UpdateBetaInput(strawberry.django.NodeInput):
    name: strawberry.auto


@strawberry.type
class Mutation:
    @strawberry.mutation
    def log_out(self, info: Info) -> None:
        """
        Log out the current user (if any)
        """
        logout(info.context.request)

    update_user: UserNode = mutations.update(
        UpdateUserInput,
        extensions=[HasRetvalPerm(permission(User, PermissionType.EDIT))],
    )

    @strawberry.mutation(
        extensions=[InputMutationExtension(), CreateGuestUser()]
    )
    def create_boulder_with_friends(
        self,
        info: Info,
        image: ImageUpload,
        problem_name: Optional[str],
        beta_name: Optional[str],
    ) -> BetaNode:
        """
        Create a new boulder from an image, and create a default problem and
        beta along with it.

        Returns the created beta, which can be used to grab the created problem
        and boulder as well (via nested objects).
        """
        # A nice big party!
        boulder = resolvers.create(
            # The `name` field isn't used yet, but it needs a placeholder value
            info,
            Boulder,
            {"name": "boulder", "image": image},
        )
        problem = resolvers.create(
            info,
            Problem,
            {
                "boulder": boulder,
                "owner": info.context.request.user,
                "name": problem_name,
            },
        )
        # User can grab the problem+boulder from the beta
        return resolvers.create(
            info,
            Beta,
            {
                "problem": problem,
                "owner": info.context.request.user,
                "name": beta_name,
            },
        )

    @strawberry.mutation(
        extensions=[
            InputMutationExtension(),
            HasRetvalPerm(permission(Hold, PermissionType.CREATE)),
        ],
    )
    def create_hold(
        self,
        info: Info,
        problem: Annotated[
            relay.GlobalID,
            strawberry.argument(
                description="The ID of the problem to add the hold to."
            ),
        ],
        position: Annotated[
            Optional[SVGPositionInput],
            strawberry.argument(
                description="Position of the hold within the boulder image,"
                " or null for random"
            ),
        ],
    ) -> HoldNode:
        """
        Create a new hold and add it to a problem. There is no option to create
        a hold just on a boulder, because there's no use case for that yet.
        """
        # Resolve input to a django object
        problem_dj: Problem = problem.resolve_node_sync(
            info, ensure_type=Problem
        )

        normal_position: BoulderPosition
        if position:
            # Convert SVG position to normalized position
            normal_position = position.to_normalized(problem_dj.boulder.image)
            source = HoldAnnotationSource.USER
        else:
            # Pick a random position on the image. # Bias toward the middle,
            # so the new hold is easy to see
            normal_position = BoulderPosition(
                random.triangular(), random.triangular()
            )
            source = HoldAnnotationSource.AUTO

        # Create the hold, then link it to the problem
        hold_dj = resolvers.create(
            info,
            Hold,
            {
                "problem": problem_dj,
                "position": normal_position,
                "source": source,
            },
        )

        return hold_dj

    @strawberry.mutation(
        extensions=[
            InputMutationExtension(),
            HasRetvalPerm(permission(Hold, PermissionType.EDIT)),
        ],
    )
    def update_hold(
        self,
        info: Info,
        id: relay.GlobalID,
        position: Optional[SVGPositionInput],
        annotation: Optional[str],
    ) -> HoldNode:
        hold: Hold = id.resolve_node_sync(info, ensure_type=Hold)
        # Convert position from SVG coords to normalized (DB) coords
        normal_position = position and position.to_normalized(
            hold.problem.boulder.image
        )
        return resolvers.update(
            info,
            hold,
            {
                "position": normal_position,
                "annotation": annotation,
            },
        )

    delete_hold: HoldNode = mutations.delete(
        strawberry.django.NodeInput,
        extensions=[HasRetvalPerm(permission(Hold, PermissionType.DELETE))],
    )

    update_problem: ProblemNode = mutations.update(
        UpdateProblemInput,
        extensions=[HasRetvalPerm(permission(Problem, PermissionType.EDIT))],
    )
    delete_problem: ProblemNode = mutations.delete(
        strawberry.django.NodeInput,
        extensions=[HasRetvalPerm(permission(Problem, PermissionType.DELETE))],
    )

    @strawberry.mutation(
        extensions=[InputMutationExtension(), CreateGuestUser()]
    )
    def copy_problem(self, info: Info, id: relay.GlobalID) -> ProblemNode:
        """
        Copy a problem. A new problem will be created with the same boulder
        and holds as the original.
        """
        original_problem: Problem = id.resolve_node_sync(
            info, ensure_type=Problem
        )
        # Copy the base problem. We'll point the new problem to the same
        # boulder, so we get the same image.
        new_problem = resolvers.create(
            info,
            Problem,
            {
                "boulder": original_problem.boulder,
                "name": f"{original_problem.name} Copy",
                "owner": info.context.request.user,
            },
        )

        # Copy each hold in one big INSERT
        new_holds = list(original_problem.holds.all())
        for hold in new_holds:
            hold.id = None  # This forces django to create a new move
            hold.problem_id = new_problem.id
        Hold.objects.bulk_create(new_holds)

        return new_problem

    @strawberry.mutation(
        extensions=[InputMutationExtension(), CreateGuestUser()]
    )
    def create_beta(
        self,
        info: Info,
        problem: relay.GlobalID,
        name: Optional[str],
    ) -> BetaNode:
        problem_dj: Problem = problem.resolve_node_sync(
            info, ensure_type=Problem
        )
        return resolvers.create(
            info,
            Beta,
            {
                "problem": problem_dj,
                "owner": info.context.request.user,
                "name": name,
            },
        )

    update_beta: BetaNode = mutations.update(
        UpdateBetaInput,
        extensions=[HasRetvalPerm(permission(Beta, PermissionType.EDIT))],
    )
    delete_beta: BetaNode = mutations.delete(
        strawberry.django.NodeInput,
        extensions=[HasRetvalPerm(permission(Beta, PermissionType.DELETE))],
    )

    @strawberry.mutation(
        extensions=[InputMutationExtension(), CreateGuestUser()]
    )
    def copy_beta(self, info: Info, id: relay.GlobalID) -> BetaNode:
        original_beta = id.resolve_node_sync(info, ensure_type=Beta)
        # Copy the base beta
        new_beta = resolvers.create(
            info,
            Beta,
            {
                "problem": original_beta.problem,
                "name": f"{original_beta.name} Copy",
                "owner": info.context.request.user,
            },
        )

        # Copy each move in one big INSERT
        new_moves = list(original_beta.moves.all())
        for move in new_moves:
            move.id = None  # This forces django to create a new move
            move.beta_id = new_beta.id
        BetaMove.objects.bulk_create(new_moves)

        return new_beta

    @strawberry.mutation(
        extensions=[
            InputMutationExtension(),
            HasRetvalPerm(permission(BetaMove, PermissionType.CREATE)),
        ],
    )
    def create_beta_move(
        self,
        info: Info,
        beta: relay.GlobalID,
        body_part: BodyPart,
        hold: Optional[relay.GlobalID],
        position: Optional[SVGPositionInput],
        previous_beta_move: Annotated[
            Optional[relay.GlobalID],
            strawberry.argument(
                description="Move prior to this one in the beta "
                "(null for first move)"
            ),
        ],
    ) -> BetaMoveNode:
        """
        Add a new move to a beta. The move can either be appended to the end,
        or inserted in the middle (by specifying a previousBetaMove).
        """

        # Convert GQL IDs to PKs
        beta_dj: Beta = beta.resolve_node_sync(info, ensure_type=Beta)
        hold_dj = hold and (hold.resolve_node_sync(info, ensure_type=Hold))
        previous_beta_move_dj = previous_beta_move and (
            previous_beta_move.resolve_node_sync(info, ensure_type=BetaMove)
        )

        # Convert position from SVG coords to normalized [0,1]
        normal_position = position and position.to_normalized(
            beta_dj.problem.boulder.image
        )

        # ===== Validation =====
        if (
            previous_beta_move_dj
            and previous_beta_move_dj.beta_id != beta_dj.id
        ):
            return ValidationError(
                "Previous move must belong to the given beta"
            )
        if hold_dj and hold_dj.problem_id != beta_dj.problem_id:
            return ValidationError(
                "Hold and beta must belong to the same problem"
            )
        if (hold and position) or (not hold and not position):
            return ValidationError(
                "Exactly one of hold or position must be given"
            )

        return resolvers.create(
            info,
            BetaMove,
            {
                "beta": beta_dj,
                "hold": hold_dj,
                "body_part": body_part,
                "order": previous_beta_move_dj
                and previous_beta_move_dj.order + 1,
                "position": normal_position,
            },
            # By default, Django will enforce beta+order uniqueness, but we want
            # to disable this to allow for mid-beta inserts. A pre-save trigger
            # will take care of sliding orders around to keep them compliant
            full_clean={"exclude": ["beta"]},
        )

    @strawberry.mutation(
        extensions=[
            InputMutationExtension(),
            HasRetvalPerm(permission(BetaMove, PermissionType.EDIT)),
        ],
    )
    def update_beta_move(
        self,
        info: Info,
        id: relay.GlobalID,
        order: Optional[int],
        hold: Optional[relay.GlobalID],
        position: Optional[SVGPositionInput],
        annotation: Optional[str],
    ) -> BetaMoveNode:
        beta_move_dj: BetaMove = id.resolve_node_sync(
            info, ensure_type=BetaMove
        )
        hold_dj = hold and (hold.resolve_node_sync(info, ensure_type=Hold))
        normal_position = position and position.to_normalized(
            beta_move_dj.beta.problem.boulder.image
        )

        # Because these fields are mutually exclusive, if one of them is passed
        # in the mutation, we need to explicitly set the other to null, rather
        # than leaving it at its previous value
        if hold_dj and normal_position:
            raise ValidationError("Cannot assign both hold and position")
        if hold_dj:
            normal_position = None
        elif normal_position:
            hold_dj = None

        return resolvers.update(
            info,
            beta_move_dj,
            {
                "order": order,
                "hold": hold_dj,
                "position": normal_position,
                "annotation": annotation,
            },
            # By default, Django will enforce beta+order uniqueness, but we want
            # to disable this to allow for reordering moves. A pre-save trigger
            # will take care of sliding orders around to keep them compliant
            full_clean={"exclude": ["beta"]},
        )

    delete_beta_move: BetaMoveNode = mutations.delete(
        strawberry.django.NodeInput,
        extensions=[HasRetvalPerm(permission(BetaMove, PermissionType.DELETE))],
    )
