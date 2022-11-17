import { useContext, useMemo } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { EditorHighlightedItemContext } from "./context";
import { Stance } from "./svg";
import { useCurrentStance_betaMoveNodeConnection$key } from "./__generated__/useCurrentStance_betaMoveNodeConnection.graphql";

/**
 * Get the list of moves in the current body stance (AKA body position).
 * This is determined by finding the *last* move of each body part that is *not
 * after* the currently highlighted move.
 *
 * @param betaMoveConnectionKey Relay fragment key
 * @returns A list of IDs of the moves in the current body position. The list
 *  will be empty iff there is no move highlighted.
 */
function useCurrentStance(
  betaMoveConnectionKey: useCurrentStance_betaMoveNodeConnection$key
): Partial<Stance> {
  const betaMoveConnection = useFragment(
    graphql`
      fragment useCurrentStance_betaMoveNodeConnection on BetaMoveNodeConnection {
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
  const [highlightedItem] = useContext(EditorHighlightedItemContext);

  return useMemo(() => {
    // If there isn't a highlighted move, then there's no current stance
    if (highlightedItem?.kind !== "move") {
      return {};
    }

    // Find the most recent position of each body part at the point of the
    // highlighted move. Moves should always be sorted by order!
    const stance: Partial<Stance> = {};
    for (const edge of betaMoveConnection.edges) {
      const move = edge.node;
      stance[move.bodyPart] = move.id;

      // If we've reached the highlighted move, everything after is irrelevant
      if (move.id === highlightedItem.betaMoveId) {
        break;
      }
    }

    return stance;
  }, [betaMoveConnection, highlightedItem]);
}

export default useCurrentStance;
