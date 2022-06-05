import { useTheme } from "@mui/material";
import React from "react";
import {
  BetaOverlayMove,
  BodyPart,
  getMoveVisualPosition,
  OverlayPosition,
} from "util/svg";

interface Props {
  moves: BetaOverlayMove[];
  highlightedMove: string;
}

/**
 * A visual for the body's current position on a given move.
 */
const BodyState: React.FC<Props> = ({ moves, highlightedMove }) => {
  const { palette } = useTheme();

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
      {values.map((move) => {
        const visualPosition = getMoveVisualPosition(move);
        return (
          <line
            key={move.id}
            stroke={palette.secondary.main}
            strokeWidth={0.6}
            strokeDasharray="2,2"
            x1={center.x}
            y1={center.y}
            x2={visualPosition.x}
            y2={visualPosition.y}
          />
        );
      })}
    </>
  );
};

export default BodyState;
