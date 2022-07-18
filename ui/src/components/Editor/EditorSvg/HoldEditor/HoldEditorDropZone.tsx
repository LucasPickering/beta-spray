import React from "react";
import { DropHandler, useDrop } from "util/dnd";
import { assertIsDefined } from "util/func";
import { useDOMToSVGPosition } from "util/svg";
import PanZone from "../PanZone";

interface Props extends Omit<React.ComponentProps<typeof PanZone>, "onDrop"> {
  onDrop?: DropHandler<"holdOverlay">;
}

/**
 * A layer to catch clicks and drops on the hold editor.
 */
const HoldEditorDropZone: React.FC<Props> = ({ onDrop, ...rest }) => {
  const domToSVGPosition = useDOMToSVGPosition();

  // Listen for holds being dropped
  const [, drop] = useDrop<"holdOverlay">({
    accept: "holdOverlay",
    // Tell the dragger where they airdropped to
    drop(item, monitor) {
      const mousePos = monitor.getClientOffset();
      assertIsDefined(mousePos);

      // Call provided drop handler, if given
      const result = { position: domToSVGPosition(mousePos) };
      if (onDrop) {
        onDrop(item, result);
      }

      return result;
    },
  });

  // We need to rely on the standard pan zone because we can't have more than
  // one element trying to capture clicks/drags across the entire screen. So
  // it will handle both sets of logic for us.
  return <PanZone ref={drop} {...rest} />;
};

export default HoldEditorDropZone;
