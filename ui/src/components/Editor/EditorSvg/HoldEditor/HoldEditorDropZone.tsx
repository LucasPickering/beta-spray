import React from "react";
import { styleAddObject } from "styles/svg";
import { useDrop } from "util/dnd";
import { assertIsDefined } from "util/func";
import { useOverlayUtils } from "util/svg";
import InvisibleZone from "../InvisibleZone";

interface Props {
  onClick?: React.MouseEventHandler<SVGRectElement>;
}

/**
 * A layer to catch clicks and drops on the hold editor.
 */
const HoldEditorDropZone: React.FC<Props> = ({ onClick }) => {
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

  return <InvisibleZone ref={drop} css={styleAddObject} onClick={onClick} />;
};

export default HoldEditorDropZone;
