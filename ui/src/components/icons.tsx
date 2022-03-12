/**
 * SVG icons, that don't include the outer SVG. These are meant to be used only
 * inside another SVG (e.g. the overlay).
 *
 * These are all scaled/shifted to be self-centered and generally the same size.
 */

import React from "react";

export const IconX = React.forwardRef<
  SVGPathElement,
  React.HTMLAttributes<SVGPathElement>
>((props, ref) => <path d="M-1 -1 l2 2 M-1 1 l2 -2" ref={ref} {...props} />);

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

// TODO use or remove
export const IconHand = React.forwardRef<
  SVGPathElement,
  React.HTMLAttributes<SVGPathElement>
>((props, ref) => (
  // From HeroIcons.hand
  <path
    ref={ref}
    strokeLinecap="round"
    strokeLinejoin="round"
    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
    transform="translate(-2.5 -2.5) scale(0.2 0.2) "
    fill="none"
    {...props}
  />
));
