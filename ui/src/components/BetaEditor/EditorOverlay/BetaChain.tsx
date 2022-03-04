import React from "react";
import { BetaOverlayMove } from "./types";
import BetaChainCircle from "./BetaChainCircle";
import BetaChainLine from "./BetaChainLine";

interface Props {
  moves: BetaOverlayMove[];
  // TODO type alias
  createBetaMove: ({ holdId }: { holdId: string }) => void;
}

/**
 * A "beta chain" is the sequence of moves that a particular body parts performs
 * during a beta.
 */
const BetaChain: React.FC<Props> = ({ moves, createBetaMove }) => (
  <>
    {moves.map((move) => (
      // There *should* only be one "new" move at a time
      <React.Fragment key={move.kind === "saved" ? move.id : "new"}>
        {/* Draw a line from the last move to this one */}
        {move.prev && <BetaChainLine startMove={move.prev} endMove={move} />}

        <BetaChainCircle move={move} onDrop={createBetaMove} />
      </React.Fragment>
    ))}
  </>
);

export default BetaChain;
