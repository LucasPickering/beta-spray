import React from "react";
import { useDrop } from "util/dnd";
import { assertIsDefined } from "util/func";
import { useOverlayUtils } from "util/svg";
import PanZone from "../PanZone";

/**
 * A layer to catch clicks and drops on the hold editor.
 */
const HoldEditorDropZone: React.FC<React.ComponentProps<typeof PanZone>> = (
  props
) => {
  const { toSvgPosition } = useOverlayUtils();

  // Listen for holds being dropped
  const [, drop] = useDrop<"holdOverlay">({
    accept: "holdOverlay",
    // Tell the dragger where they airdropped to
    drop(item, monitor) {
      const mousePos = monitor.getClientOffset();
      assertIsDefined(mousePos);
      return { position: toSvgPosition(mousePos) };
    },
  });

  // We need to rely on the standard pan zone because we can't have more than
  // one element trying to capture clicks/drags across the entire screen. So
  // it will handle both sets of logic for us.
  return <PanZone ref={drop} {...props} />;
};

export default HoldEditorDropZone;
