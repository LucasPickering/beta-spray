import clsx from "clsx";
import React from "react";
import { useDrag } from "react-dnd";
import { BetaOverlayMove, DndDragItem, DndDropResult } from "../types";
import Circle from "../Circle";
import { DragType } from "util/dnd";
import classes from "./BetaChainCircle.scss";
import commonClasses from "../common.scss";

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
      if (result && onDrop) {
        onDrop(item, result);
      }
    },
  }));

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
      innerLabel={(move.order + 1).toString()}
      onDoubleClick={onDoubleClick && (() => onDoubleClick(move))}
    />
  );
};

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
