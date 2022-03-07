import React from "react";
import { BetaOverlayMove } from "./types";
import BetaChainCircle from "./BetaChainCircle";
import BetaChainLine from "./BetaChainLine";
import { assertDataKind } from "util/func";

interface Props {
  moves: BetaOverlayMove[];
  // TODO type alias
  createBetaMove: (input: { holdId: string }) => void;
  updateBetaMove: (input: { betaMoveId: string; holdId: string }) => void;
}

/**
 * A "beta chain" is the sequence of moves that a particular body parts performs
 * during a beta.
 */
const BetaChain: React.FC<Props> = ({
  moves,
  createBetaMove,
  updateBetaMove,
}) => (
  <>
    {moves.map((move) => (
      // There *should* only be one "new" move at a time
      <React.Fragment key={move.kind === "saved" ? move.id : "new"}>
        {/* Draw a line from the last move to this one */}
        {move.prev && <BetaChainLine startMove={move.prev} endMove={move} />}

        <BetaChainCircle
          move={move}
          onDrop={({ holdId }) => {
            // "new" moves shouldn't ever be draggable
            assertDataKind(move, "saved");

            // If the dragged move is the last in the beta, then add a new move,
            // otherwise update the existing move to the new hold
            // TODO figure out how to update the last move without creating
            // a new one
            if (move.next) {
              updateBetaMove({ betaMoveId: move.id, holdId });
            } else {
              createBetaMove({ holdId });
            }
          }}
        />
      </React.Fragment>
    ))}
  </>
);

export default BetaChain;
