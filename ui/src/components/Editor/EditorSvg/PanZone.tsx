import React, { useEffect, useState } from "react";
import { useDrag } from "util/dnd";
import { useOverlayUtils } from "util/svg";
import { useZoomPan } from "util/zoom";
import InvisibleZone from "./InvisibleZone";
import { OverlayPosition, subtract } from "util/svg";
import { XYCoord } from "react-dnd";

/**
 * Invisible layer to manage panning. This captures drag actions to pan the
 * viewport around the SVG.
 */
const PanZone: React.FC = () => {
  const { updatePan } = useZoomPan();
  const { toSvgPosition } = useOverlayUtils();
  // This will constantly update while panning, so we can track how much the
  // cursor moves on each frame to update pan offset by that amount
  const [prevClientOffset, setPrevClientOffset] = useState<
    OverlayPosition | undefined
  >();

  // Use dnd to manage dragging. We have no drop target here cause we care about
  // the drag action itself. On every render, we'll update the offset
  const [{ isDragging, clientOffset }, drag] = useDrag<
    "svgPan",
    {
      isDragging: boolean;
      clientOffset: XYCoord | null;
    }
  >({
    type: "svgPan",
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
        clientOffset: monitor.getClientOffset(),
      };
    },
  });

  useEffect(() => {
    if (clientOffset && prevClientOffset) {
      // Change to offset is just how mnuch the cursor has moved since the last
      // time we applied change. We do prev-current though, because panning
      // goes in the opposite direction as the cursor movement.
      //
      // WARNING: You might think "wow it's dumb how we're converting to SVG
      // position twice on every render, we should just convert it once in the
      // useDrag collector then everything else just handles SVG positions and
      // it's all clean and shiny yippee". You're right! Except that for some
      // fucking reason, returning the SVG position from the collector causes it
      // to not trigger a re-render when the cursor moves, and everything stops
      // working. I spent a day debugging it, save yourself and just leave it.
      const offsetDelta = subtract(
        toSvgPosition(prevClientOffset),
        toSvgPosition(clientOffset)
      );
      updatePan(offsetDelta);
    }
    setPrevClientOffset(clientOffset ?? undefined);
    // Deliberately excluding prevCursorPosition to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientOffset]);

  return <InvisibleZone ref={drag} css={isDragging && { cursor: "move" }} />;
};

export default PanZone;
