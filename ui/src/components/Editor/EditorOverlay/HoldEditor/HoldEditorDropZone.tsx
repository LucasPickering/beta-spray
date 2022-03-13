import React from "react";
import { useDrop } from "util/dnd";
import { assertIsDefined } from "util/func";
import { useOverlayUtils } from "util/useOverlayUtils";

interface Props {
  onClick?: React.MouseEventHandler<SVGRectElement>;
}

/**
 * A layer to catch clicks and drops on the hold editor.
 */
const HoldEditorDropZone: React.FC<Props> = ({ onClick }) => {
  const { getMouseCoords } = useOverlayUtils();

  // Listen for holds being dropped
  const [, drop] = useDrop<"holdOverlay">({
    accept: "holdOverlay",
    // Tell the dragger where they airdropped to
    drop(item, monitor) {
      const mousePos = monitor.getClientOffset();
      assertIsDefined(mousePos);
      return { position: getMouseCoords(mousePos) };
    },
  });

  return (
    <rect ref={drop} width="100%" height="100%" opacity={0} onClick={onClick} />
  );
};

export default HoldEditorDropZone;
