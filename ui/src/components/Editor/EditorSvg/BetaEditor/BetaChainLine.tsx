import React from "react";
import { BetaOverlayMove, getMoveVisualPosition } from "util/svg";
import { DropHandler, useDrag } from "util/dnd";
import { styleDraggable, styleDragging } from "styles/svg";

interface Props {
  startMove: BetaOverlayMove;
  endMove: BetaOverlayMove;
  onDrop?: DropHandler<"betaMoveOverlay">;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainLine: React.FC<Props> = ({ startMove, endMove, onDrop }) => {
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
      css={[{ strokeWidth: 1.5 }, styleDraggable, isDragging && styleDragging]}
      stroke={endMove.color.fill}
      x1={startPos.x}
      y1={startPos.y}
      x2={endPos.x}
      y2={endPos.y}
    />
  );
};

export default BetaChainLine;
