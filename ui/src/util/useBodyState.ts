import { useContext, useMemo } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { EditorHighlightedMoveContext } from "./context";
import { BodyPart } from "./svg";
import { useBodyState_betaMoveNodeConnection$key } from "./__generated__/useBodyState_betaMoveNodeConnection.graphql";

/**
 * Get the list of moves in the current body state (AKA body position or stance).
 * This is determined by finding the *last* move of each body part that is *not
 * after* the currently highlighted move.
 *
 * @param betaMoveConnectionKey Relay fragment key
 * @returns A list of IDs of the moves in the current body position. The list
 *  will be empty iff there are no moves in the beta.
 */
function useBodyState(
  betaMoveConnectionKey: useBodyState_betaMoveNodeConnection$key
): string[] {
  const betaMoveConnection = useFragment(
    graphql`
      fragment useBodyState_betaMoveNodeConnection on BetaMoveNodeConnection {
        edges {
          node {
            id
            bodyPart
          }
        }
      }
    `,
    betaMoveConnectionKey
  );
  const [highlightedMoveId] = useContext(EditorHighlightedMoveContext);

  const moves = useMemo(() => {
    // Find the most recent position of each body part at the point of the
    // highlighted move. Moves should always be sorted by order!
    const lastMoves: Map<BodyPart, string> = new Map();
    for (const edge of betaMoveConnection.edges) {
      const move = edge.node;
      lastMoves.set(move.bodyPart, move.id);

      // If we've reached the highlighted move, everything after is irrelevant
      if (move.id === highlightedMoveId) {
        break;
      }
    }

    return Array.from(lastMoves.values());
  }, [betaMoveConnection, highlightedMoveId]);

  return moves;
}

export default useBodyState;
