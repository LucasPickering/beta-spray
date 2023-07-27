from dataclasses import dataclass
from typing import Any, Optional

from django.db import models
from typing_extensions import Self


@dataclass
class BoulderPosition:
    """
    Positions are *0-1*, not in pixels!! This allows for scaling on the image
    without messing up these positions"""

    x: float
    y: float

    @classmethod
    def parse(cls, value: str) -> Self:
        """
        Parse a string position to a struct value
        """
        x, y = (float(v) for v in value.split(","))
        return cls(x, y)

    def serialize(self) -> str:
        """
        Serialize a BoulderPosition into a string
        """
        return f"{self.x},{self.y}"


class BoulderPositionField(models.Field):
    """
    A model field that contains a visual position within a boulder. This could
    be the position of a hold, move, etc. The value is stored as a stringified
    version of x/y, where each coordinate is [0,1], representing its position
    as a fraction of the full width/height of the image, respectively. This
    makes the coordinates dimension-independent, allowing for scaling without
    creating data issues.

    Technically it would be better/cleaner to use a composite type in postgres
    to store this, but Django doesn't have native support for that and it's a
    lot more work to set it up than it's worth, considering we're never doing
    any filtering/math with the float values in the database. If we ever find
    that need, then we can migrate this to a composite type.
    """

    def db_type(self, connection: Any) -> str:
        return "char(50)"

    def from_db_value(
        self, value: Optional[str], expression: Any, connection: Any
    ) -> Optional[BoulderPosition]:
        if value is None:
            return None
        return BoulderPosition.parse(value)

    def to_python(
        self, value: Optional[BoulderPosition | str]
    ) -> Optional[BoulderPosition]:
        if isinstance(value, BoulderPosition):
            return value

        if value is None:
            return value

        # Value is assumed to be a string
        return BoulderPosition.parse(value)

    def get_prep_value(
        self, position: Optional[BoulderPosition]
    ) -> Optional[str]:
        if position is None:
            return None
        return position.serialize()

    def value_to_string(self, obj: object) -> Optional[str]:
        value = self.value_from_object(obj)
        return self.get_prep_value(value)


class MoveOrderField(models.PositiveIntegerField):
    """
    A field type for the `order` field on `BetaMove`. This field is commonly
    populated via a subquery for INSERTs, which means it needs to be included
    in the RETURNING clause to get the calculated value.
    """

    db_returning = True
