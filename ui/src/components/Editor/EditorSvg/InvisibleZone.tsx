import React, { useContext } from "react";
import { SvgContext } from "util/context";

/**
 * An invisible rectangle that covers the entire SVG. This is useful for
 * capturing mouse events.
 */
const InvisibleZone = React.forwardRef<
  SVGRectElement,
  React.SVGProps<SVGRectElement>
>((props, ref) => {
  const { dimensions } = useContext(SvgContext);

  return (
    <rect
      ref={ref}
      // Fill the entire SVG. WARNING: don't try width=100%&height=100%! Those
      // percentages are relative to *viewport* size, not SVG size. We could
      // hypothetically do that, but would then need to set x&y to match the
      // viewport offset, which seems more complicated than this solution (and
      // triggers more re-renders)
      width={dimensions.width}
      height={dimensions.height}
      opacity={0}
      {...props}
    />
  );
});

InvisibleZone.displayName = "InvisibleZone";

export default InvisibleZone;
