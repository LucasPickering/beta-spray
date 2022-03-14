/**
 * SVG icons, that don't include the outer SVG. These are meant to be used only
 * inside another SVG (e.g. the overlay).
 *
 * These are all scaled/shifted to be self-centered and generally the same size.
 */

import React from "react";

export const IconTriangle = React.forwardRef<
  SVGPolygonElement,
  React.HTMLAttributes<SVGPolygonElement>
>((props, ref) => (
  <polygon
    points="0,-0.866 -1,0.866 1,0.866"
    transform="scale(1.3)"
    ref={ref}
    {...props}
  />
));

IconTriangle.displayName = "IconTriangle";
