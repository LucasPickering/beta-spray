import clsx from "clsx";
import React from "react";
import { useDrop } from "react-dnd";
import { DndDragItem, DndDropResult, OverlayPosition } from "./types";
import { DragType } from "util/dnd";
import Circle from "./Circle";
import classes from "./HoldCircle.scss";
import commonClasses from "./common.scss";

interface Props {
  className?: string;
  holdId: string;
  position: OverlayPosition;
}

const HoldCircle: React.FC<Props> = ({ className, holdId, position }) => {
  const [{ isOver }, drop] = useDrop<
    DndDragItem,
    DndDropResult,
    { isOver: boolean }
  >(() => ({
    // TODO don't allow drop if move is already on this hold
    accept: DragType.BetaMoveSvg,
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Tell the dragger which hold they just dropped onto
    drop: () => ({ kind: "hold", holdId }),
  }));

  return (
    <Circle
      ref={drop}
      className={clsx(
        classes.holdCircle,
        isOver && commonClasses.dropHover,
        className
      )}
      position={position}
    />
  );
};

HoldCircle.defaultProps = {} as Partial<Props>;

export default HoldCircle;
