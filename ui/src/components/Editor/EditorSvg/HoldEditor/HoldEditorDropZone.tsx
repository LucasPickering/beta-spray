import React, { useContext } from "react";
import { styleAddObject } from "styles/dnd";
import { SvgContext } from "util/context";
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
  const { dimensions } = useContext(SvgContext);
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
      opacity={0}
      css={styleAddObject}
      onClick={onClick}
    />
  );
};

export default HoldEditorDropZone;
