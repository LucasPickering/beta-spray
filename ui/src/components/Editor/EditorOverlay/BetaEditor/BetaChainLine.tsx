import React from "react";
import { BetaOverlayMove } from "../types";
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
      // TODO don't create new move if we didn't actually move
      if (result && onDrop) {
        onDrop(item, result);
      }
    },
  });

  return (
    <line
      ref={drag}
      css={[styleDraggable, isDragging && styleDragging]}
      stroke={palette.bodyParts[startMove.bodyPart]}
      x1={startMove.position.x}
      y1={startMove.position.y}
      x2={endMove.position.x}
      y2={endMove.position.y}
    />
  );
};

BetaChainLine.defaultProps = {} as Partial<Props>;

export default BetaChainLine;
