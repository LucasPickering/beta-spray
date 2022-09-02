from django.db import models
from collections import namedtuple


"""
Positions are *0-1*, not in pixels!! This allows for scaling on the image
without messing up these positions
"""
BoulderPosition = namedtuple("BoulderPosition", "x y")


def parse_position(value):
    """
    Parse a string position to a struct value
    """
    x, y = (float(v) for v in value.split(","))
    return BoulderPosition(x, y)


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

    def db_type(self, connection):
        return "char(50)"

    def from_db_value(self, value, expression, connection):
        if value is None:
            return None
        return parse_position(value)

    def to_python(self, value):
        if isinstance(value, BoulderPosition):
            return value

        if value is None:
            return value

        # Value is assumed to be a string
        return parse_position(value)

    def get_prep_value(self, position):
        if position is None:
            return None
        return f"{position.x},{position.y}"
