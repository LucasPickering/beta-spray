import { assertIsDefined, isDefined } from "util/func";
import React, { useContext, useRef, useState } from "react";
import { useDOMToSVGPosition } from "components/Editor/util/svg";
import { useZoomPan } from "components/Editor/util/zoom";
import { subtract } from "components/Editor/util/svg";
import { useDrag } from "@use-gesture/react";
import { Interpolation, Theme } from "@emotion/react";
import { SvgContext } from "components/Editor/util/context";
import { useDrop } from "../util/dnd";

interface Props extends React.SVGProps<SVGRectElement> {
  css?: Interpolation<Theme>;
}

/**
 * Invisible layer to manage panning. This captures drag actions to pan the
 * viewport around the SVG.
 *
 * Since we can only have one element that captures events over the whole SVG,
 * this component also serves as a drop zone for holds and moves. This doesn't
 * accept an onDrop callback though, to keep things simple. You should handle
 * the action on the dragger's side.
 *
 * There should always be exactly one PanZone in the component tree!
 */
const PanZone: React.FC<Props> = ({ onClick, css: parentCss, ...rest }) => {
  const { updatePan } = useZoomPan();
  const domToSVGPosition = useDOMToSVGPosition();
  const { dimensions } = useContext(SvgContext);
  const [isDragging, setIsDragging] = useState(false);
  // We have to manually cancel clicks while dragging
  const shouldCancelClick = useRef<boolean>(false);

  // Listen for holds being dropped
  const [, drop] = useDrop({
    accept: ["overlayHold", "overlayBetaMove"],
    // Tell the dragger where they airdropped to
    drop(item, monitor) {
      const mousePos = monitor.getClientOffset();
      assertIsDefined(mousePos);
      return {
        kind: "dropZone",
        position: domToSVGPosition(mousePos),
      };
    },
  });

  // Since we don't need to listen for dropping here, just dragging, it's much
  // easier to use use-gesture instead of react-dnd.
  const bind = useDrag(({ dragging, movement, memo }) => {
    // Note: there is a `delta` arg available here, but mapping a pixel delta
    // to SVG delta is really annoying. It's easier to map the points
    // independently, *then* calculate the delta
    setIsDragging(dragging ?? false);

    // As soon as we pan at all, cancel the onClick handler
    const [x, y] = movement;
    if (x !== 0 || y !== 0) {
      shouldCancelClick.current = true;
    }

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
      ref={drop}
      // Fill the entire SVG. WARNING: don't try width=100%&height=100%! Those
      // percentages are relative to *viewport* size, not SVG size. We could
      // hypothetically do that, but would then need to set x&y to match the
      // viewport offset, which seems more complicated than this solution (and
      // triggers more re-renders)
      width={dimensions.width}
      height={dimensions.height}
      onClick={(e) => {
        // If we dragged at all during this click, then don't trigger onClick
        if (shouldCancelClick.current) {
          e.stopPropagation();
          shouldCancelClick.current = false;
        } else {
          onClick?.(e);
        }
      }}
      css={[
        parentCss,
        { opacity: 0, touchAction: "none" },
        onClick && { cursor: "pointer" },
        isDragging && { cursor: "move" },
      ]}
      {...bind()}
      {...rest}
    />
  );
};

export default PanZone;
