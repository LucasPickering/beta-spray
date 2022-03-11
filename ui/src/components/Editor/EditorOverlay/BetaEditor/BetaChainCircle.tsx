import clsx from "clsx";
import React from "react";
import { BetaOverlayMove, formatOrder } from "../types";
import Circle from "../Circle";
import { DragItem, DropResult, useDrag } from "util/dnd";
import classes from "./BetaChainCircle.scss";
import commonClasses from "../common.scss";

interface Props {
  className?: string;
  move: BetaOverlayMove;
  isLast: boolean;
  onDrop?: (
    item: DragItem<"betaMoveSvg">,
    dropResult: DropResult<"betaMoveSvg">
  ) => void;
  onDoubleClick?: (move: BetaOverlayMove) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainCircle: React.FC<Props> = ({
  className,
  move,
  isLast,
  onDrop,
  onDoubleClick,
}) => {
  const [{ isDragging }, drag] = useDrag<
    "betaMoveSvg",
    { isDragging: boolean }
  >({
    type: "betaMoveSvg",
    item: { kind: "move", move, isLast },
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

  return (
    <Circle
      ref={drag}
      // The last move in the chain gets styled differently
      className={clsx(
        classes.betaMove,
        commonClasses.draggable,
        isDragging && commonClasses.dragging,
        classes[move.bodyPart],
        className
      )}
      position={move.position}
      innerLabel={formatOrder(move.order)}
      onDoubleClick={onDoubleClick && (() => onDoubleClick(move))}
    />
  );
};

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
