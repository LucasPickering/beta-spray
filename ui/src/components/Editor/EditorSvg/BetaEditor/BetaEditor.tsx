import React, { useMemo } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaEditor_betaNode$key } from "./__generated__/BetaEditor_betaNode.graphql";
import BetaMoveDialog from "./BetaMoveDialog";
import { groupBy } from "util/func";
import BodyState from "./BodyState";
import BetaChainLine from "./BetaChainLine";
import BetaChainMark from "./BetaChainMark";
import withQuery from "util/withQuery";
import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "components/Editor/queries";
import { getBetaMoveColors, getBetaMoveVisualPositions } from "util/svg";
import { BetaContext } from "util/context";

interface Props {
  betaKey: BetaEditor_betaNode$key;
}

/**
 * SVG overlay component for viewing and editing beta
 */
const BetaEditor: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaEditor_betaNode on BetaNode {
        id
        ...BetaMoveDialog_betaNode
        moves {
          ...BodyState_betaMoveNodeConnection
          edges {
            node {
              id
              bodyPart
              order
              isStart
              hold {
                id
                position {
                  x
                  y
                }
              }
              ...BetaChainMark_betaMoveNode
              ...BetaChainLine_startBetaMoveNode
              ...BetaChainLine_endBetaMoveNode
            }
          }
        }
      }
    `,
    betaKey
  );

  // Just a little helper, since we access this a lot. Technically it's wasted
  // space since we never access this array directly, just map over it again,
  // but who cares code is for people.
  const moves = useMemo(
    () => beta.moves.edges.map((edge) => edge.node),
    [beta.moves.edges]
  );

  // Calculate some derived data based on the full list of moves. It's better
  // to do this in a single memoized object instead of separate ones, to save
  // React memoization checks on each render
  const { movesByBodyPart, betaMoveColors, betaMoveVisualPositions } = useMemo(
    () => ({
      movesByBodyPart: groupBy(moves, (move) => move.bodyPart),
      // Group the moves by body part so we can draw chains. We assume the API
      // response is ordered by `order`, so these should naturally be as well.
      betaMoveColors: getBetaMoveColors(moves),
      betaMoveVisualPositions: getBetaMoveVisualPositions(moves),
    }),
    [moves]
  );

  // Render one "chain" of moves per body part
  return (
    <BetaContext.Provider value={{ betaMoveColors, betaMoveVisualPositions }}>
      {/* Draw lines to connect the moves. Do this *first* so they go on bottom */}
      {Array.from(movesByBodyPart.values(), (moveChain) =>
        moveChain.map((move, i) => {
          const prev = moveChain[i - 1];
          return prev ? (
            <BetaChainLine
              key={move.id}
              startMoveKey={prev}
              endMoveKey={move}
            />
          ) : null;
        })
      )}

      {/* Render body position. This will only show something if the user is
          hovering a move. We want this above the move lines, but below the
          move marks so it's not intrusive. */}
      <BodyState betaMoveConnectionKey={beta.moves} />

      {/* Draw the actual move marks */}
      {moves.map((move) => (
        <BetaChainMark key={move.id} betaMoveKey={move} />
      ))}

      {/* After clicking a hold, show a modal to add a move to it */}
      <BetaMoveDialog betaKey={beta} />
    </BetaContext.Provider>
  );
};

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  // This is rendered on top of the existing editor, so we don't want to block
  // anything while beta is loading
  fallbackElement: null,
})(BetaEditor);
