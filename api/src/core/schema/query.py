from typing import Annotated, Iterable, Optional

import strawberry
from django.contrib.auth.models import User
from django.db.models import Model, Q
from django.db.models.fields.files import ImageFieldFile
from strawberry import UNSET, relay
from strawberry.types import Info
from typing_extensions import Self

from .. import util
from ..fields import BoulderPosition
from ..models import (
    Beta,
    BetaMove,
    BodyPart,
    Boulder,
    Hold,
    HoldKind,
    HoldOrientation,
    Problem,
    Visibility,
)
from ..permissions import PermissionType, permission


@strawberry.type
class Permissions:
    """
    Permission info for the requesting user on the parent object.
    """

    can_edit: bool = strawberry.field(description="Can you edit this object?")
    can_delete: bool = strawberry.field(
        description="Can you delete this object?"
    )


def get_permissions(self: Model, info: Info) -> Permissions:
    """
    Permissions for the requesting user (you) on the parent object.
    Attempting any mutation that you don't have permission for will result
    in an error.
    """
    user = info.context.request.user
    return Permissions(
        can_edit=user.has_perm(permission(self, PermissionType.EDIT), self),
        can_delete=user.has_perm(permission(self, PermissionType.DELETE), self),
    )


@strawberry.type
class Image:
    """
    An image, e.g. JPG or PNG
    """

    url: str = strawberry.field(description="Image access URL")
    width: int = strawberry.field(description="Image width, in pixels")
    height: int = strawberry.field(description="Image height, in pixels")

    @strawberry.field
    def svg_width(self) -> float:
        """
        Image width, either `100` if portrait or `width/height*100` if landscape
        """
        return util.get_svg_dimensions(self)[0]

    @strawberry.field
    def svg_height(self) -> float:
        """
        Image height, either `100` if landscape or `height/width*100` if
        portrait
        """
        return util.get_svg_dimensions(self)[1]


@strawberry.type
class SVGPosition:
    """
    A 2D position in an image, in the terms that the UI uses. The bounds of the
    coordinates are:
        - `[0, 100]` in the smaller of the two dimensions
        - `[0, 100 * width / height]` or `[0, 100 * height / width]`

    The origin is the top-left, with X increasing to the right and Y increasing
    down.

    The purpose of this system is to provide normalized width and height so that
    UI elements can be sized statically without having to worry about varying
    image resolutions.
    """

    x: float = strawberry.field(description="X position, 0-100ish")
    y: float = strawberry.field(description="Y position, 0-100ish")

    @classmethod
    def from_boulder_position(
        cls, boulder_position: BoulderPosition, image: Image | ImageFieldFile
    ) -> Self:
        """
        Map a normalized position, where both components are [0,1], to an SVG
        position, where X and Y are in SVG coordinates, based on image
        dimensions.
        """
        (svg_width, svg_height) = util.get_svg_dimensions(image)
        return cls(
            x=boulder_position.x * svg_width, y=boulder_position.y * svg_height
        )


@strawberry.type
class NoUser:
    """
    An empty object representing an unauthenticated user. This is essentially
    a null, but Relay has limitations around store management for null values
    (you can't invalidate a null value to force a refetch), so we need to
    provide this instead. And you can't have empty types, so we need a
    placeholder field.
    """

    ignore: str = ""


@strawberry.django.type(User)
class UserNode(relay.Node):
    """
    A user of Beta Spray
    """

    username: strawberry.auto = strawberry.field(description="Username")

    @strawberry.field
    def is_current_user(self: User, info: Info) -> bool:
        """
        Is this the authenticated user? False if unauthenticated.
        """
        return self.id == info.context.request.user.id

    @strawberry.django.field(
        select_related="profile", only=["profile__is_guest"]
    )
    def is_guest(self: User) -> bool:
        """
        Is this user a guest? True if the user has not created an account. Only
        exposed to self.
        """
        # TODO only expose to current user
        return self.profile.is_guest


@strawberry.django.type(Boulder)
class BoulderNode(relay.Node):
    """
    A boulder is a wall or rock that has holds on it. In the context of this
    API, a boulder is defined by a 2D raster image of it. The holds are then
    defined in X/Y coordinates, in reference to the image.
    """

    created_at: strawberry.auto = strawberry.field(
        description="Date+time of object creation"
    )
    permissions: Permissions = strawberry.field(resolver=get_permissions)
    image: Image = strawberry.field()


@strawberry.django.type(Problem)
class ProblemNode(relay.Node):
    """
    A "problem" is a boulder route. It consists of a series of holds on a
    boulder.
    """

    name: strawberry.auto = strawberry.field(
        description="User-friendly name of the problem"
    )
    external_link: strawberry.auto = strawberry.field(
        description="External link, e.g. to Mountain Project"
    )
    created_at: strawberry.auto = strawberry.field(
        description="Date+time of object creation"
    )
    owner: UserNode = strawberry.field()
    permissions: Permissions = strawberry.field(resolver=get_permissions)
    visibility: Visibility = strawberry.field()
    boulder: BoulderNode = strawberry.field()
    holds: relay.ListConnection["HoldNode"] = strawberry.django.connection(
        prefetch_related="holds"
    )
    betas: relay.ListConnection["BetaNode"] = strawberry.django.connection(
        prefetch_related="betas"
    )


@strawberry.django.type(Hold)
class HoldNode(relay.Node):
    """
    A hold is a particular point on a boulder that can be grabbed or otherwise
    used by a climber.
    """

    problem: ProblemNode = strawberry.field()
    created_at: strawberry.auto = strawberry.field(
        description="Date+time of object creation"
    )
    permissions: Permissions = strawberry.field(resolver=get_permissions)
    kind: HoldKind = strawberry.field(
        description="Type of hold, e.g. jug or crimp"
    )
    orientation: HoldOrientation = strawberry.field(
        description="Orientation of the hold (opposite the direction of pull)"
    )
    annotation: strawberry.auto = strawberry.field(
        description="Informative text related to the hold, created by the user"
    )

    @strawberry.django.field(
        select_related=["problem__boulder"], only=["problem__boulder__image"]
    )
    def position(self) -> SVGPosition:
        return SVGPosition.from_boulder_position(
            self.position, self.problem.boulder.image
        )


@strawberry.django.type(Beta)
class BetaNode(relay.Node):
    """
    A beta is a sequence of moves that solves a problem. The word is really used
    as a mass known so the phrase "a beta" is actually incorrect, but treating
    it as a singular noun makes the verbiage much easier in code.
    """

    name: strawberry.auto = strawberry.field(
        description="User-friendly name of the beta"
    )
    created_at: strawberry.auto = strawberry.field(
        description="Date+time of object creation"
    )
    owner: UserNode = strawberry.field()
    permissions: Permissions = strawberry.field(resolver=get_permissions)
    problem: ProblemNode = strawberry.field()
    moves: relay.ListConnection["BetaMoveNode"] = strawberry.django.connection(
        prefetch_related="moves"
    )


@strawberry.django.type(BetaMove)
class BetaMoveNode(relay.Node):
    """
    A singular move within a beta, which is a body part+location pairing. This
    may be confusing because a "move" can also refer to the motion of a body
    part from point A to point B, but in the context of this API, a move
    always refers to a particular body part in a particular position.

    Most moves are attached to a particular hold, but not all. For example,
    flagging a leg or smearing a foot will apply to a general area on the
    boulder rather than a particular hold.
    """

    created_at: strawberry.auto = strawberry.field(
        description="Date+time of object creation"
    )
    permissions: Permissions = strawberry.field(resolver=get_permissions)
    beta: BetaNode = strawberry.field()
    body_part: BodyPart = strawberry.field(description="Body part being moved")
    order: int = strawberry.field(
        description="The ordering of this move within the beta, starting at 1"
    )
    is_start: bool = strawberry.field(
        description="Is this one of the initial moves for the beta?"
    )
    annotation: strawberry.auto = strawberry.field(
        description="Informative text related to the move, created by the user"
    )

    @strawberry.django.field(
        description="Where the move is going; either a hold or a free position",
        select_related=["beta__problem__boulder"],
        only=["beta__problem__boulder__image"],
    )
    def target(self: BetaMove) -> HoldNode | SVGPosition:  # type: ignore[misc]
        # Note: You may be tempted to have this return the hold position when
        # available so the frontend doesn't have to handle that logic. But wait!
        # That doesn't work because then if the hold position is modified, Relay
        # doesn't know to update the associated move position(s) in local state,
        # so the data gets out of sync.
        if self.position:
            return SVGPosition.from_boulder_position(
                self.position, self.beta.problem.boulder.image
            )
        return self.hold


@strawberry.type
class Query:
    @strawberry.relay.connection(relay.ListConnection[ProblemNode])
    def problems(
        self,
        info: Info,
        is_mine: Annotated[
            Optional[bool],
            strawberry.argument(
                description="Are you the creator of the problem?"
                " If set, show only your problems, or only someone else's."
            ),
        ] = UNSET,
        visibility: Annotated[
            Optional[Visibility],
            strawberry.argument(description="Filter by problem visibility"),
        ] = UNSET,
    ) -> Iterable[ProblemNode]:
        """
        Access problems by list
        """

        # owner_id is non-nullable so the second param here is redundant, but
        # it's a backup just in case. Otherwise, any problem lacking an owner
        # would be returned if the current user is anonymous (id=None)
        is_mine_query = Q(
            owner_id=info.context.request.user.id, owner_id__isnull=False
        )

        # By default, don't show anyone else's unlisted problems
        q = Q(visibility=Visibility.PUBLIC) | is_mine_query

        if is_mine is not UNSET:
            if is_mine:
                q &= is_mine_query
            else:
                q &= ~is_mine_query
        if visibility is not UNSET:
            q &= Q(visibility=visibility)

        return Problem.objects.filter(q)

    problem: Optional[ProblemNode] = strawberry.django.node(
        description="Get a problem by ID"
    )
    beta: Optional[BetaNode] = strawberry.django.node(
        description="Get a beta by ID"
    )

    # TODO rename return type to CurrentUser after
    # https://github.com/strawberry-graphql/strawberry/issues/2302
    @strawberry.field()
    def current_user(self, info: Info) -> UserNode | NoUser:
        """
        Get data on the requesting user (you). Null for unauthenticated users.
        Unauthenticated users who have performed a mutation will be logged in
        as a guest user.
        """
        user = info.context.request.user
        return NoUser() if user.is_anonymous else user
