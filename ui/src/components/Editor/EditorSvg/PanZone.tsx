import React, { useState } from "react";
import { useOverlayUtils } from "util/svg";
import { useZoomPan } from "util/zoom";
import InvisibleZone from "./InvisibleZone";
import { subtract } from "util/svg";
import { useDrag } from "@use-gesture/react";
import { isDefined } from "util/func";

/**
 * Invisible layer to manage panning. This captures drag actions to pan the
 * viewport around the SVG.
 */
const PanZone: React.FC = () => {
  const { updatePan } = useZoomPan();
  const { toSvgPosition } = useOverlayUtils();
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
        toSvgPosition({ x: prevMovementX, y: prevMovementY }),
        toSvgPosition({ x: movementX, y: movementY })
      );
      updatePan(offsetDelta);
    }

    // memoize for next call
    return { movement };
  });

  return (
    <InvisibleZone
      {...bind()}
      css={[{ touchAction: "none" }, isDragging && { cursor: "move" }]}
    />
  );
};

export default PanZone;
