from core import util
from core.fields import BoulderPosition
import graphene


class SVGPositionInput(graphene.InputObjectType):
    x = graphene.Float(required=True, description="X position, 0-100ish")
    y = graphene.Float(required=True, description="Y position, 0-100ish")

    def to_normalized(self, image):
        """
        Normalize a position, such that the x/y values are both [0,1] rather
        than based on the SVG dimensions.
        """
        (svg_width, svg_height) = util.get_svg_dimensions(image)
        return BoulderPosition(self.x / svg_width, self.y / svg_height)
