import clsx from "clsx";
import React from "react";
import { useDrag } from "react-dnd";
import { BetaOverlayMove, DndDragItem, DndDropResult } from "./types";
import Circle from "./Circle";
import { DragType } from "util/dnd";
import classes from "./BetaChainCircle.scss";
import commonClasses from "./common.scss";

interface Props {
  className?: string;
  move: BetaOverlayMove;
  onDrop?: (item: DndDragItem, dropResult: DndDropResult) => void;
  onDoubleClick?: (move: BetaOverlayMove) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainCircle: React.FC<Props> = ({
  className,
  move,
  onDrop,
  onDoubleClick,
}) => {
  // TODO type alias
  const [{ isDragging }, drag] = useDrag<
    DndDragItem,
    DndDropResult,
    { isDragging: boolean }
  >(() => ({
    type: DragType.BetaMoveSvg,
    item: { kind: "move", move },
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
  }));

  return (
    <g transform={`translate(${move.position.x},${move.position.y})`}>
      <Circle
        ref={drag}
        // The last move in the chain gets styled differently
        className={clsx(
          classes.betaMove,
          !move.next && classes.lastBetaMove,
          isDragging && commonClasses.dragging,
          classes[move.bodyPart],
          className
        )}
        position={{ x: 0, y: 0 }}
        onDoubleClick={onDoubleClick && (() => onDoubleClick(move))}
      />
      <text
        className={classes.text}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {move.order + 1}
      </text>
      {/* First move in the chain gets a body part label */}
      {!move.prev && (
        <text className={classes.text} x={2} y={2}>
          {move.bodyPart}
        </text>
      )}
    </g>
  );
};

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
