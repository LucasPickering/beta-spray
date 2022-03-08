import clsx from "clsx";
import React from "react";
import { useDrag } from "react-dnd";
import { BodyPart, DndDragItem, DndDropResult, OverlayPosition } from "./types";
import Circle from "./Circle";
import { DragType } from "util/dnd";
import classes from "./BetaPrototypeCircle.scss";
import commonClasses from "./common.scss";

interface Props {
  className?: string;
  bodyPart: BodyPart;
  position: OverlayPosition;
  onDrop?: (item: DndDragItem, dropResult: DndDropResult) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaPrototypeCircle: React.FC<Props> = ({
  className,
  bodyPart,
  position,
  onDrop,
}) => {
  const [{ isDragging }, drag] = useDrag<
    DndDragItem,
    DndDropResult,
    { isDragging: boolean }
  >(() => ({
    type: DragType.BetaMoveSvg,
    item: { kind: "newMove", bodyPart },
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
        classes.betaPrototype,
        isDragging && commonClasses.dragging,
        classes[bodyPart],
        className
      )}
      position={position}
      outerLabel={bodyPart}
    />
  );
};

BetaPrototypeCircle.defaultProps = {} as Partial<Props>;

export default BetaPrototypeCircle;
