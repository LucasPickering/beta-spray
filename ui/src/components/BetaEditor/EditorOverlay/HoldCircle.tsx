import clsx from "clsx";
import React from "react";
import { useDrop } from "react-dnd";
import { OverlayPosition, DragType } from "./types";
import Circle from "./Circle";
import classes from "./HoldCircle.scss";

interface Props {
  className?: string;
  holdId: string;
  position: OverlayPosition;
}

const HoldCircle: React.FC<Props> = ({ className, holdId, position }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    // TODO don't allow drop if move is already on this hold
    accept: DragType.BetaMove,
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Tell the dragger which hold they just dropped onto
    drop: () => ({ holdId }),
  }));

  return (
    <Circle
      ref={drop}
      className={clsx(classes.holdCircle, className)}
      position={position}
      opacity={isOver ? 0.5 : 1.0}
    />
  );
};

HoldCircle.defaultProps = {} as Partial<Props>;

export default HoldCircle;
