import clsx from "clsx";
import React from "react";
import { useDrag } from "react-dnd";
import { D3Position, DragType } from "util/d3";
import classes from "./d3.scss";

interface Props {
  className?: string;
  // TODO type alias (or fragment)
  startMove: { betaMoveId: string; position: D3Position };
  endMove: { betaMoveId: string; position: D3Position };
  // TODO type alias
  onDrop: ({ holdId }: { holdId: string }) => void;
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
    { holdId: string },
    { isDragging: boolean }
  >(() => ({
    type: DragType.BetaMove,
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

  return (
    <line
      className={clsx(classes.betaMoveLine, className)}
      x1={startMove.position.x}
      y1={startMove.position.y}
      x2={endMove.position.x}
      y2={endMove.position.y}
    />
  );
};

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
