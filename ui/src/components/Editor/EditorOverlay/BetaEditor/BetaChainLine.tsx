import clsx from "clsx";
import React from "react";
import { BetaOverlayMove } from "../types";
import { DragItem, DropResult, useDrag } from "util/dnd";
import classes from "./BetaChainLine.scss";
import commonClasses from "../common.scss";

interface Props {
  className?: string;
  startMove: BetaOverlayMove;
  endMove: BetaOverlayMove;
  onDrop?: (
    item: DragItem<"betaMoveSvg">,
    dropResult: DropResult<"betaMoveSvg">
  ) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainLine: React.FC<Props> = ({
  className,
  startMove,
  endMove,
  onDrop,
}) => {
  // TODO type alias
  const [{ isDragging }, drag] = useDrag<
    "betaMoveSvg",
    { isDragging: boolean }
  >({
    type: "betaMoveSvg",
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
      className={clsx(
        classes.betaChainLine,
        commonClasses.draggable,
        isDragging && commonClasses.dragging,
        classes[startMove.bodyPart],
        className
      )}
      x1={startMove.position.x}
      y1={startMove.position.y}
      x2={endMove.position.x}
      y2={endMove.position.y}
    />
  );
};

BetaChainLine.defaultProps = {} as Partial<Props>;

export default BetaChainLine;
