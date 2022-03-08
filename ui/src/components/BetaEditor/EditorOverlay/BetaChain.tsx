import React from "react";
import { BetaOverlayMove } from "./types";
import BetaChainCircle from "./BetaChainCircle";
import BetaChainLine from "./BetaChainLine";

interface Props {
  moves: BetaOverlayMove[];
  // TODO type alias
  createBetaMove: (input: { holdId?: string; order?: number }) => void;
  updateBetaMove: (input: { betaMoveId: string; holdId: string }) => void;
  deleteBetaMove: (input: { betaMoveId: string }) => void;
}

/**
 * A "beta chain" is the sequence of moves that a particular body parts performs
 * during a beta.
 */
const BetaChain: React.FC<Props> = ({
  moves,
  createBetaMove,
  updateBetaMove,
  deleteBetaMove,
}) => (
  <>
    {/* Draw a line from the last move to this one. Draw these *first* so they
    go on the bottom */}
    {moves.map(
      (move) =>
        move.prev && (
          <BetaChainLine
            startMove={move.prev}
            endMove={move}
            onDrop={({ holdId }) => {
              createBetaMove({ holdId, order: move.order });
            }}
          />
        )
    )}
    {moves.map((move) => (
      <React.Fragment key={move.id}>
        <BetaChainCircle
          move={move}
          onDrop={({ holdId }) => {
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
          onDoubleClick={() => deleteBetaMove({ betaMoveId: move.id })}
        />
      </React.Fragment>
    ))}
  </>
);

export default BetaChain;
