import React from "react";
import { DropHandler } from "util/dnd";
import { BetaOverlayMove } from "../types";
import BetaChainCircle from "./BetaChainCircle";
import BetaChainLine from "./BetaChainLine";

interface Props {
  moves: BetaOverlayMove[];
  onDrop?: DropHandler<"betaMoveSvg">;
  onDoubleClick?: (move: BetaOverlayMove) => void;
}

/**
 * A "beta chain" is the sequence of moves that a particular body parts performs
 * during a beta.
 */
const BetaChain: React.FC<Props> = ({ moves, onDrop, onDoubleClick }) => (
  <>
    {/* Draw a line from the last move to this one. Draw these *first* so they
    go on the bottom */}
    {moves.map(
      (move) =>
        move.prev && (
          <BetaChainLine
            key={move.id}
            startMove={move.prev}
            endMove={move}
            onDrop={onDrop}
          />
        )
    )}
    {moves.map((move) => (
      <BetaChainCircle
        key={move.id}
        move={move}
        onDrop={onDrop}
        onDoubleClick={onDoubleClick}
      />
    ))}
  </>
);

export default BetaChain;
