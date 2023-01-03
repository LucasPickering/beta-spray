import React, { useContext, useState } from "react";
import { useDOMToSVGPosition } from "components/Editor/util/svg";
import { useZoomPan } from "components/Editor/util/zoom";
import { subtract } from "components/Editor/util/svg";
import { useDrag } from "@use-gesture/react";
import { isDefined } from "util/func";
import { Interpolation, Theme } from "@emotion/react";
import { SvgContext } from "components/Editor/util/context";

interface Props extends React.SVGProps<SVGRectElement> {
  css?: Interpolation<Theme>;
}

/**
 * Invisible layer to manage panning. This captures drag actions to pan the
 * viewport around the SVG.
 *
 * This supports being extended for other full-screen action listeners, e.g.
 * listening for clicks in the hold editor. If you need to capture any sort of
 * actions across the entire editor pane, *use this component rather than
 * adding another*. Otherwise, whichever element is on top will eat events from
 * the other.
 *
 * There should always be exactly one PanZone in the component tree!
 */
const PanZone = React.forwardRef<SVGRectElement, Props>(
  ({ css: parentCss, ...rest }, ref) => {
    const { updatePan } = useZoomPan();
    const domToSVGPosition = useDOMToSVGPosition();
    const { dimensions } = useContext(SvgContext);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Since we don't need to listen for dropping here, just dragging, it's much
    // easier to use use-gesture instead of react-dnd.
    const bind = useDrag(({ dragging, movement, memo }) => {
      // Note: there is a `delta` arg available here, but mapping a pixel delta
      // to SVG delta is really annoying. It's easier to map the points
      // independently, *then* calculate the delta
      setIsDragging(dragging ?? false);

      // This is memoized from the previous call, unless this is the first call
      // of the drag (in which case we won't pan yet)
      const prevMovement = memo?.movement as [number, number] | undefined;

      // `movement` is the distance we've moved since the start of the drag, in
      // DOM pixels. Convert that to SVG units so the panning maps 1:1.
      if (isDefined(prevMovement)) {
        const [prevMovementX, prevMovementY] = prevMovement;
        const [movementX, movementY] = movement;
        // We do previous-current to get a negative offset, since the view box
        // shifts in the opposite direction of cursor movement
        const offsetDelta = subtract(
          domToSVGPosition({ x: prevMovementX, y: prevMovementY }),
          domToSVGPosition({ x: movementX, y: movementY })
        );
        updatePan(offsetDelta);
      }

      // memoize for next call
      return { movement };
    });

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
        css={[
          parentCss,
          { opacity: 0, touchAction: "none" },
          isDragging && { cursor: "move" },
        ]}
        {...bind()}
        {...rest}
      />
    );
  }
);

PanZone.displayName = "PanZone";

export default PanZone;
