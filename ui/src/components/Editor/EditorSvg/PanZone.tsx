import React, { useEffect, useState } from "react";
import { useDrag } from "util/dnd";
import useOverlayUtils from "util/useOverlayUtils";
import { useZoomPan } from "util/zoom";
import InvisibleZone from "./InvisibleZone";
import { OverlayPosition, subtract } from "./types";

/**
 * Invisible layer to manage panning. This captures drag actions to pan the
 * viewport around the SVG.
 */
const PanZone: React.FC = () => {
  const { updatePan } = useZoomPan();
  const { toSvgPosition } = useOverlayUtils();
  // This will constantly update while panning, so we can track how much the
  // cursor moves on each frame to update pan offset by that amount
  const [prevCursorPosition, setPrevCursorPosition] = useState<OverlayPosition>(
    {
      x: 0,
      y: 0,
    }
  );

  // Use dnd to manage dragging. We have no drop target here cause we care about
  // the drag action itself. On every render, we'll update the offset
  const [{ isDragging, cursorPosition }, drag] = useDrag<
    "svgPan",
    { isDragging: boolean; cursorPosition: OverlayPosition | undefined }
  >({
    type: "svgPan",
    collect(monitor) {
      const clientOffset = monitor.getClientOffset();

      return {
        isDragging: Boolean(monitor.isDragging()),
        cursorPosition: clientOffset ? toSvgPosition(clientOffset) : undefined,
      };
    },
  });

  useEffect(() => {
    if (cursorPosition) {
      // Change to offset is just how mnuch the cursor has moved since the last
      // time we applied change. We do prev-current though, because panning
      // goes in the opposite direction as the cursor movement.
      const offsetDelta = subtract(prevCursorPosition, cursorPosition);
      updatePan(offsetDelta);
      setPrevCursorPosition(cursorPosition);
    }
  }, [updatePan, prevCursorPosition, cursorPosition]);

  // When not dragging, reset last applied to 0
  useEffect(() => {
    if (!isDragging) {
      setPrevCursorPosition({ x: 0, y: 0 });
    }
  }, [isDragging]);

  return <InvisibleZone ref={drag} css={isDragging && { cursor: "move" }} />;
};

export default PanZone;
