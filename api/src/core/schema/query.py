from typing import Optional, Union

from django.contrib.auth.models import User
from django.db.models.fields.files import ImageFieldFile
from guest_user.functions import is_guest_user
from strawberry.types import Info
from strawberry_django_plus import gql
from strawberry_django_plus.gql import relay
from typing_extensions import Self

from core import util
from core.fields import BoulderPosition
from core.models import (
    Beta,
    BetaMove,
    BodyPart,
    Boulder,
    Hold,
    Problem,
    Visibility,
)


@gql.type
class Image:
    """
    An image, e.g. JPG or PNG
    """

    url: str = gql.field(description="Image access URL")
    width: int = gql.field(description="Image width, in pixels")
    height: int = gql.field(description="Image height, in pixels")

    @gql.field
    def svg_width(self) -> float:
        """
        Image width, either `100` if portrait or `width/height*100` if landscape
        """
        return util.get_svg_dimensions(self)[0]

    @gql.field
    def svg_height(self) -> float:
        """
        Image height, either `100` if landscape or `height/width*100` if
        portrait
        """
        return util.get_svg_dimensions(self)[1]


@gql.type
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

    x: float = gql.field(description="X position, 0-100ish")
    y: float = gql.field(description="Y position, 0-100ish")

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


@gql.type
class NoUser:
    """
    An empty object representing an unauthenticated user. This is essentially
    a null, but Relay has limitations around store management for null values
    (you can't invalidate a null value to force a refetch), so we need to
    provide this instead. And you can't have empty types, so we need a
    placeholder field.
    """

    ignore: str = ""


@gql.django.type(User)
class UserNode(relay.Node):
    """
    A user of Beta Spray
    """

    username: gql.auto = gql.field(description="Username")

    @gql.field
    def is_guest(self) -> bool:
        """
        Is this user a guest? True if the user has not created an account. Only
        exposed to self.
        """
        # TODO only expose to current user
        return is_guest_user(self)


@gql.django.type(Boulder)
class BoulderNode(relay.Node):
    """
    A boulder is a wall or rock that has holds on it. In the context of this
    API, a boulder is defined by a 2D raster image of it. The holds are then
    defined in X/Y coordinates, in reference to the image.
    """

    created_at: gql.auto = gql.field(description="Date+time of object creation")
    image: Image = gql.field()
    problems: relay.Connection["ProblemNode"] = gql.django.connection()
    holds: relay.Connection["HoldNode"] = gql.django.connection()


@gql.django.type(Hold)
class HoldNode(relay.Node):
    """
    A hold is a particular point on a boulder that can be grabbed or otherwise
    used by a climber.
    """

    boulder: BoulderNode = gql.field()
    created_at: gql.auto = gql.field(description="Date+time of object creation")
    annotation: gql.auto = gql.field(
        description="Informative text related to the hold, created by the user"
    )

    @gql.field
    def position(self) -> SVGPosition:
        return SVGPosition.from_boulder_position(
            self.position, self.boulder.image
        )


@gql.django.type(Problem)
class ProblemNode(relay.Node):
    """
    A "problem" is a boulder route. It consists of a series of holds on a
    boulder.
    """

    name: gql.auto = gql.field(description="User-friendly name of the problem")
    external_link: gql.auto = gql.field(
        description="External link, e.g. to Mountain Project"
    )
    created_at: gql.auto = gql.field(description="Date+time of object creation")
    owner: UserNode = gql.field()
    visibility: Visibility = gql.field()
    boulder: BoulderNode = gql.field()
    holds: relay.Connection[HoldNode] = gql.django.connection()
    betas: relay.Connection["BetaNode"] = gql.django.connection()


@gql.django.type(Beta)
class BetaNode(relay.Node):
    """
    A beta is a sequence of moves that solves a problem. The word is really used
    as a mass known so the phrase "a beta" is actually incorrect, but treating
    it as a singular noun makes the verbiage much easier in code.
    """

    name: gql.auto = gql.field(description="User-friendly name of the beta")
    created_at: gql.auto = gql.field(description="Date+time of object creation")
    owner: UserNode = gql.field()
    problem: ProblemNode = gql.field()
    moves: relay.Connection["BetaMoveNode"] = gql.django.connection()


@gql.django.type(BetaMove)
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

    created_at: gql.auto = gql.field(description="Date+time of object creation")
    beta: BetaNode = gql.field()
    body_part: BodyPart = gql.field(description="Body part being moved")
    order: int = gql.field(
        description="The ordering of this move within the beta, starting at 1"
    )
    is_start: bool = gql.field(
        description="Is this one of the initial moves for the beta?"
    )
    annotation: gql.auto = gql.field(
        description="Informative text related to the move, created by the user"
    )
    # TODO is there a better way to represent mutually exclusive fields?
    hold: Optional[HoldNode] = gql.field(
        description="The optional hold that this move is attached to. If null,"
        " the move is 'free', e.g. a flag or smear."
    )

    @gql.field(description="Position of a free move. Null for attached moves.")
    def position(self) -> Optional[SVGPosition]:
        # Note: You may be tempted to have this return the hold position when
        # available so the frontend doesn't have to handle that logic. But wait!
        # That doesn't work because then if the hold position is modified, Relay
        # doesn't know to update the associated move position(s) in local state,
        # so the data gets out of sync.
        return self.position and SVGPosition.from_boulder_position(
            self.position, self.beta.problem.boulder.image
        )


@gql.type
class Query:
    boulders: relay.Connection[BoulderNode] = gql.django.connection(
        description="Access boulders by list"
    )
    boulder: Optional[BoulderNode] = relay.node(
        description="Get a boulder by ID"
    )
    problems: relay.Connection[ProblemNode] = gql.django.connection(
        description="Access problems by list"
    )
    problem: Optional[ProblemNode] = relay.node(
        description="Get a problem by ID"
    )
    beta: Optional[BetaNode] = relay.node(description="Get a beta by ID")

    @gql.field()
    def current_user(self, info: Info) -> Union[UserNode, NoUser]:
        """
        Get data on the requesting user (you). Null for unauthenticated users.
        Unauthenticated users who have performed a mutation will be logged in
        as a guest user.
        """
        user = info.context.request.user
        return NoUser() if user.is_anonymous else user
