import clsx from "clsx";
import React from "react";
import { useDrag } from "react-dnd";
import { D3Position, DragType } from "util/d3";
import Circle from "./Circle";
import classes from "./d3.scss";

interface Props {
  className?: string;
  position: D3Position;
  isLastMove: boolean;
  // TODO type alias
  onDrop: ({ holdId }: { holdId: string }) => void;
}

/**
 * A circle representing a single beta move
 */
const BetaMoveCircle: React.FC<Props> = ({
  className,
  position,
  isLastMove,
  onDrop,
}) => {
  // TODO type alias
  const [{ isDragging }, drag] = useDrag<
    undefined,
    { holdId: string },
    { isDragging: boolean }
  >(() => ({
    type: DragType.BetaMove,
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end: (item, monitor) => {
      const result = monitor.getDropResult();
      if (result) {
        onDrop(result);
      }
    },
  }));

  return (
    <Circle
      ref={drag}
      // The last move in the chain gets styled differently
      className={clsx(
        classes.betaMove,
        isLastMove && classes.lastBetaMove,
        className
      )}
      position={position}
      opacity={isDragging ? 0.5 : 1.0}
    />
  );
};

BetaMoveCircle.defaultProps = {} as Partial<Props>;

export default BetaMoveCircle;
