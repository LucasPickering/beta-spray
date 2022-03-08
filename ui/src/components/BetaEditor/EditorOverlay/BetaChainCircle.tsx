import clsx from "clsx";
import React from "react";
import { useDrag } from "react-dnd";
import { BetaOverlayMove } from "./types";
import Circle from "./Circle";
import classes from "./BetaChainCircle.scss";
import { DragType } from "util/dnd";

interface Props {
  className?: string;
  move: BetaOverlayMove;
  // TODO type alias
  onDrop?: (input: { holdId: string }) => void;
  onDoubleClick?: () => void;
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
    undefined,
    // TODO type alias
    { holdId: string },
    { isDragging: boolean }
  >(() => ({
    type: DragType.BetaMoveSvg,
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end: (item, monitor) => {
      const result = monitor.getDropResult();
      // TODO don't create new move if we didn't actually move
      if (result && onDrop) {
        onDrop(result);
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
          classes[move.bodyPart],
          className
        )}
        position={{ x: 0, y: 0 }}
        opacity={isDragging ? 0.5 : 1.0}
        onDoubleClick={onDoubleClick}
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
