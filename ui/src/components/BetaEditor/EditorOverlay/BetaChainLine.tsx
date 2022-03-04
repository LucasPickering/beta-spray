import clsx from "clsx";
import React from "react";
import { BetaOverlayMove } from "./types";
import classes from "./BetaChainLine.scss";

interface Props {
  className?: string;
  startMove: BetaOverlayMove;
  endMove: BetaOverlayMove;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainCircle: React.FC<Props> = ({
  className,
  startMove,
  endMove,
}) => {
  return (
    <line
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
