import { useMemo } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { findNodeIndex, isDefined } from "./func";
import { Stance } from "./svg";
import useHighlight from "./useHighlight";
import { useCurrentStance_betaMoveNodeConnection$key } from "./__generated__/useCurrentStance_betaMoveNodeConnection.graphql";

/**
 * Get the list of moves in the current body stance (AKA body position).
 * This is determined by finding the *last* move of each body part that is *not
 * after* the currently highlighted move. If the
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
            isStart
          }
        }
      }
    `,
    betaMoveConnectionKey
  );
  const [highlightedMove] = useHighlight("move");

  return useMemo(() => {
    // If there isn't a highlighted move, then there's no current stance
    if (!isDefined(highlightedMove)) {
      return {};
    }

    // Find the most recent position of each body part at the point of the
    // highlighted move. Moves should always be sorted by order!
    const stance: Partial<Stance> = {};
    const highlightedMoveIndex = findNodeIndex(
      betaMoveConnection,
      highlightedMove.betaMoveId
    );
    betaMoveConnection.edges
      // Remove any move after the highlighted one, *unless* it's a start move.
      // This means we'll show all start moves if any of them are highlighted,
      // which seems intuitive.
      .filter(({ node }, i) => i <= highlightedMoveIndex || node.isStart)
      // Starting at the beginning, repeated overwrite the moves in the stance,
      // leaving us with the last move of each body part.
      .forEach(({ node }) => {
        stance[node.bodyPart] = node.id;
      });

    return stance;
  }, [betaMoveConnection, highlightedMove]);
}

export default useCurrentStance;
