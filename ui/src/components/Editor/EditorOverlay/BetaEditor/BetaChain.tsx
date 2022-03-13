import React from "react";
import { DropHandler } from "util/dnd";
import { BetaOverlayMove } from "../types";
import BetaChainCircle from "./BetaChainCircle";
import BetaChainLine from "./BetaChainLine";

interface Props
  extends Pick<
    React.ComponentProps<typeof BetaChainCircle>,
    "onDoubleClick" | "onMouseEnter" | "onMouseLeave"
  > {
  moves: BetaOverlayMove[];
  onDrop?: DropHandler<"betaMoveOverlay">;
}

/**
 * A "beta chain" is the sequence of moves that a particular body parts performs
 * during a beta.
 */
const BetaChain: React.FC<Props> = ({ moves, onDrop, ...rest }) => (
  <>
    {/* Draw a line from the last move to this one. Draw these *first* so they
    go on the bottom */}
    {moves.map((move, i) => {
      const prev = moves[i - 1];
      return prev ? (
        <BetaChainLine
          key={move.id}
          startMove={prev}
          endMove={move}
          onDrop={onDrop}
        />
      ) : null;
    })}
    {moves.map((move, i) => (
      <BetaChainCircle
        key={move.id}
        move={move}
        isLast={i === moves.length - 1}
        onDrop={onDrop}
        {...rest}
      />
    ))}
  </>
);

export default BetaChain;
