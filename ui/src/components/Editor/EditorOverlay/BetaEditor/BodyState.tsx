import React from "react";
import { BetaOverlayMove, BodyPart, OverlayPosition } from "../types";

interface Props {
  moves: BetaOverlayMove[];
  highlightedMove: string;
}

/**
 * A visual for the body's current position on a given move.
 */
const BodyState: React.FC<Props> = ({ moves, highlightedMove }) => {
  // Find the most recent position of each body part at the point of the
  // highlighted move. Moves should always be sorted by order!
  const lastMoves: Map<BodyPart, BetaOverlayMove> = new Map();
  for (const move of moves) {
    lastMoves.set(move.bodyPart, move);

    // If we've reached the highlighted move, everything after is irrelevant
    if (move.id === highlightedMove) {
      break;
    }
  }

  const values = Array.from(lastMoves.values());
  const center: OverlayPosition = values.reduce(
    (acc, move) => {
      acc.x += move.position.x / values.length;
      acc.y += move.position.y / values.length;
      return acc;
    },
    { x: 0, y: 0 }
  );

  return (
    <>
      {values.map((move) => (
        <line
          key={move.id}
          stroke="red"
          strokeWidth={0.4}
          x1={center.x}
          y1={center.y}
          x2={move.position.x}
          y2={move.position.y}
        />
      ))}
    </>
  );
};

export default BodyState;
