import random
from typing import Annotated, NewType, Optional
from django.forms import ValidationError, model_to_dict
from core import models, util
from core.fields import BoulderPosition
from core.schema.query import (
    BetaMoveNode,
    BetaNode,
    HoldNode,
    Image,
    ProblemNode,
)
from strawberry.types.info import Info
from strawberry_django_plus import gql
from strawberry_django_plus.mutations import resolvers

ImageUpload = gql.scalar(
    NewType("ImageUpload", bytes),
    description="An uploaded image. To upload a file, see: "
    # Shout out to flake8, really stellar formatting here (:
    "https://strawberry.rocks/docs/guides/file-upload"
    "#sending-file-upload-requests",
    serialize=lambda v: v,
    parse_value=util.clean_input_file,
)


@gql.input
class SVGPositionInput:
    x: float = gql.field(description="X position, 0-100ish")
    y: float = gql.field(description="Y position, 0-100ish")

    def to_normalized(self, image: Image):
        """
        Normalize a position, such that the x/y values are both [0,1] rather
        than based on the SVG dimensions.
        """
        (svg_width, svg_height) = util.get_svg_dimensions(image)
        return BoulderPosition(self.x / svg_width, self.y / svg_height)


@gql.django.partial(models.Problem)
class UpdateProblemInput(gql.NodeInput):
    name: gql.auto
    external_link: gql.auto


@gql.django.input(models.Beta)
class CreateBetaInput:
    problem: gql.relay.GlobalID


@gql.django.partial(models.Beta)
class UpdateBetaInput(gql.NodeInput):
    name: gql.auto


@gql.type
class Mutation:
    @gql.relay.input_mutation
    def create_boulder_with_friends(
        self,
        info: Info,
        image: ImageUpload,
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
            models.Boulder,
            {"name": "boulder", "image": image},
        )
        problem = resolvers.create(info, models.Problem, {"boulder": boulder})
        # User can grab the problem+boulder from the beta
        return resolvers.create(info, models.Beta, {"problem": problem})

    @gql.relay.input_mutation(
        description="Create a new hold and add it to a problem. There is no"
        " option to create a hold just on a boulder, because there's no use"
        " case for that yet."
    )
    def create_hold(
        self,
        info: Info,
        problem: Annotated[
            gql.relay.GlobalID,
            gql.argument(
                description="The ID of the problem to add the hold"
                " to. If the ID references a boulder, then the hold will be"
                " created on that boulder. If a problem is given, it will be"
                " added to the problem's parent boulder as well as the problem"
                " itself."
            ),
        ],
        position: Optional[
            Annotated[
                SVGPositionInput,
                gql.argument(
                    description="Position of the hold within the boulder image,"
                    " or null for random"
                ),
            ]
        ],
    ) -> HoldNode:
        # Resolve input to a django object
        problem: models.Problem = problem.resolve_node(
            info, ensure_type=models.Problem
        )

        normal_position: BoulderPosition
        if position:
            # Convert SVG position to normalized position
            normal_position = position.to_normalized(problem.boulder.image)
            source = models.HoldAnnotationSource.USER
        else:
            # Pick a random position on the image
            normal_position = BoulderPosition(random.random(), random.random())
            source = models.HoldAnnotationSource.AUTO

        # Create the hold, then link it to the problem
        hold = resolvers.create(
            info,
            models.Hold,
            {
                "boulder": problem.boulder,
                "position": normal_position,
                "source": source,
            },
        )
        resolvers.create(
            info,
            models.ProblemHold,
            {
                "problem": problem,
                "hold": hold,
                # Regardless of how the *position* of the hold was selected,
                # the user is the one that assigned it to this problem
                "source": models.HoldAnnotationSource.USER,
            },
        )

        return hold

    @gql.relay.input_mutation
    def update_hold(
        self,
        info: Info,
        id: gql.relay.GlobalID,
        position: Optional[SVGPositionInput],
        annotation: Optional[str],
    ) -> HoldNode:
        hold: models.Hold = id.resolve_node(info, ensure_type=models.Hold)
        # Convert position from SVG coords to normalized (DB) coords
        position = position and position.to_normalized(hold.boulder.image)
        return resolvers.update(
            info,
            hold,
            {
                "position": position,
                "annotation": annotation,
            },
        )

    delete_hold: HoldNode = gql.django.delete_mutation(
        gql.NodeInput, handle_django_errors=False
    )

    update_problem: ProblemNode = gql.django.update_mutation(
        UpdateProblemInput, handle_django_errors=False
    )
    delete_problem: ProblemNode = gql.django.delete_mutation(
        gql.NodeInput, handle_django_errors=False
    )

    create_beta: BetaNode = gql.django.create_mutation(
        CreateBetaInput, handle_django_errors=False
    )
    update_beta: BetaNode = gql.django.update_mutation(
        UpdateBetaInput, handle_django_errors=False
    )
    delete_beta: BetaNode = gql.django.delete_mutation(
        gql.NodeInput, handle_django_errors=False
    )

    @gql.relay.input_mutation
    def copy_beta(self, info: Info, id: gql.relay.GlobalID) -> BetaNode:
        original_beta = id.resolve_node(info, ensure_type=models.Beta)
        # Copy the base beta
        new_beta = resolvers.create(
            info,
            models.Beta,
            {
                "problem_id": original_beta.problem_id,
                "name": f"{original_beta.name} 2.0",
            },
        )
        # Copy each move
        models.BetaMove.objects.bulk_create(
            models.BetaMove(
                # model_to_dict returns primary keys in the `hold` and `beta`
                # fields, so we need to manually remap those fields. This is a
                # little jank but still better than manually copying each field.
                **model_to_dict(move, exclude=["id", "beta", "hold"]),
                beta_id=new_beta.id,
                hold_id=move.hold_id,
            )
            for move in original_beta.moves.all()
        )
        return new_beta

    @gql.relay.input_mutation
    def create_beta_move(
        self,
        info: Info,
        beta: gql.relay.GlobalID,
        body_part: models.BodyPart,
        hold: Optional[gql.relay.GlobalID],
        position: Optional[SVGPositionInput],
        previous_beta_move: Optional[
            Annotated[
                gql.relay.GlobalID,
                gql.argument(description="Move prior to this one in the beta"),
            ]
        ],
    ) -> BetaMoveNode:
        """
        Add a new move to a beta. The move can either be appended to the end,
        or inserted in the middle (by specifying a previousBetaMove).
        """

        # Convert GQL IDs to PKs
        beta: models.Beta = beta.resolve_node(info, ensure_type=models.Beta)
        hold: models.Hold = hold and hold.resolve_node(
            info, ensure_type=models.Hold
        )
        previous_beta_move: models.BetaMove = (
            previous_beta_move
            and previous_beta_move.resolve_node(
                info, ensure_type=models.BetaMove
            )
        )

        # Convert position from SVG coords to normalized [0,1]
        position = position and position.to_normalized(
            beta.problem.boulder.image
        )

        # Make sure the move belongs to the same beta
        if previous_beta_move and previous_beta_move.beta_id != beta.id:
            return ValidationError(
                "Previous move must belong to the given beta"
            )

        # TODO validate that hold and beta belong to the same problem
        # TODO validate that exactly one of hold+position is given
        return resolvers.create(
            info,
            models.BetaMove,
            {
                "beta": beta,
                "hold": hold,
                "body_part": body_part,
                "order": previous_beta_move and previous_beta_move.order + 1,
                "position": position,
            },
            # By default, Django will enforce beta+order uniqueness, but we want
            # to disable this to allow for mid-beta inserts. A pre-save trigger
            # will take care of sliding orders around to keep them compliant
            full_clean={"exclude": ["beta"]},
        )

    @gql.relay.input_mutation
    def update_beta_move(
        self,
        info: Info,
        id: gql.relay.GlobalID,
        order: Optional[int],
        hold: Optional[gql.relay.GlobalID],
        position: Optional[SVGPositionInput],
        annotation: Optional[str],
    ) -> BetaMoveNode:
        beta_move: models.BetaMove = id.resolve_node(
            info, ensure_type=models.BetaMove
        )
        hold: models.Hold = hold and hold.resolve_node(
            info, ensure_type=models.Hold
        )
        position: BoulderPosition = position and position.to_normalized(
            beta_move.beta.problem.boulder.image
        )

        # Because these fields are mutually exclusive, if one of them is passed
        # in the mutation, we need to explicitly set the other to null, rather
        # than leaving it at its previous value
        if hold and position:
            raise ValidationError("Cannot assign both hold and position")
        if hold:
            position = None
        elif position:
            hold = None

        return resolvers.update(
            info,
            beta_move,
            {
                "order": order,
                "hold": hold,
                "position": position,
                "annotation": annotation,
            },
            # By default, Django will enforce beta+order uniqueness, but we want
            # to disable this to allow for reordering moves. A pre-save trigger
            # will take care of sliding orders around to keep them compliant
            full_clean={"exclude": ["beta"]},
        )

    delete_beta_move: BetaMoveNode = gql.django.delete_mutation(
        gql.NodeInput, handle_django_errors=False
    )
