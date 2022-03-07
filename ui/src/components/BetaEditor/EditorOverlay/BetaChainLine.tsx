import clsx from "clsx";
import React from "react";
import { BetaOverlayMove } from "./types";
import classes from "./BetaChainLine.scss";
import { DragType } from "util/dnd";
import { useDrag } from "react-dnd";

interface Props {
  className?: string;
  startMove: BetaOverlayMove;
  endMove: BetaOverlayMove;
  // TODO type alias
  onDrop?: (input: { holdId: string }) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainCircle: React.FC<Props> = ({
  className,
  startMove,
  endMove,
  onDrop,
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
    <line
      ref={drag}
      className={clsx(classes.betaChainLine, className)}
      x1={startMove.position.x}
      y1={startMove.position.y}
      x2={endMove.position.x}
      y2={endMove.position.y}
    />
  );
};

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
