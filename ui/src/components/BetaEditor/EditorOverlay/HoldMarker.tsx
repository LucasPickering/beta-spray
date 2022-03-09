import clsx from "clsx";
import React from "react";
import { useDrop } from "react-dnd";
import { DndDragItem, DndDropResult, OverlayPosition } from "./types";
import { DragType } from "util/dnd";
import Circle from "./Circle";
import classes from "./HoldMarker.scss";
import commonClasses from "./common.scss";

interface Props {
  className?: string;
  holdId: string;
  position: OverlayPosition;
  onDoubleClick?: () => void;
}

const HoldMarker: React.FC<Props> = ({
  className,
  holdId,
  position,
  onDoubleClick,
}) => {
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
        classes.holdMarker,
        isOver && commonClasses.dropHover,
        className
      )}
      position={position}
      onDoubleClick={onDoubleClick}
    />
  );
};

HoldMarker.defaultProps = {} as Partial<Props>;

export default HoldMarker;
