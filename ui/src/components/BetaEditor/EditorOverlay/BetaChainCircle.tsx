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
  onDrop: (input: { holdId: string }) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainCircle: React.FC<Props> = ({ className, move, onDrop }) => {
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
      if (result) {
        onDrop(result);
      }
    },
  }));

  if (move.kind === "new") {
    return null; // TODO
  }

  return (
    <Circle
      ref={drag}
      // The last move in the chain gets styled differently
      className={clsx(
        classes.betaMove,
        !move.next && classes.lastBetaMove,
        className
      )}
      position={move.position}
      opacity={isDragging ? 0.5 : 1.0}
    />
  );
};

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
