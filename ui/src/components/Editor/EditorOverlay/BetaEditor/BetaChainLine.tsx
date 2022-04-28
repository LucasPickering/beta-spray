import React from "react";
import { BetaOverlayMove, getMoveVisualPosition } from "../types";
import { DropHandler, useDrag } from "util/dnd";
import { styleDraggable, styleDragging } from "styles/dnd";
import { useTheme } from "@mui/material";

interface Props {
  startMove: BetaOverlayMove;
  endMove: BetaOverlayMove;
  onDrop?: DropHandler<"betaMoveOverlay">;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainLine: React.FC<Props> = ({ startMove, endMove, onDrop }) => {
  const { palette } = useTheme();
  const [{ isDragging }, drag] = useDrag<
    "betaMoveOverlay",
    { isDragging: boolean }
  >({
    type: "betaMoveOverlay",
    item: { kind: "line", startMove },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end: (item, monitor) => {
      const result = monitor.getDropResult();
      if (result && onDrop) {
        onDrop(item, result);
      }
    },
  });

  const startPos = getMoveVisualPosition(startMove);
  const endPos = getMoveVisualPosition(endMove);
  return (
    <line
      ref={drag}
      css={[styleDraggable, isDragging && styleDragging]}
      stroke={palette.bodyParts[startMove.bodyPart]}
      // TODO apply offset as a rotation transformation (so it can be animated)
      x1={startPos.x}
      y1={startPos.y}
      x2={endPos.x}
      y2={endPos.y}
    />
  );
};

export default BetaChainLine;
