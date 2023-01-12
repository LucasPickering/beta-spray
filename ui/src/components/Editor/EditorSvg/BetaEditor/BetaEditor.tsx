import { useEffect, useMemo } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaEditor_betaNode$key } from "./__generated__/BetaEditor_betaNode.graphql";
import { groupBy } from "util/func";
import StickFigure from "./StickFigure";
import BetaChainLine from "./BetaChainLine";
import BetaChainMark from "./BetaChainMark";
import { withQuery } from "relay-query-wrapper";
import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "components/Editor/queries";
import {
  getBetaMoveColors,
  getBetaMoveVisualPositions,
} from "components/Editor/util/svg";
import { BetaContext } from "components/Editor/util/context";
import { comparator } from "util/func";
import { useHighlight } from "components/Editor/util/highlight";
import { useStance, useStanceControls } from "components/Editor/util/stance";

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
        moves {
          ...stance_betaMoveNodeConnection
          edges {
            node {
              # Yes these fields are all needed, to get positions and colors
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
              position {
                x
                y
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

  // We need to reorder moves slightly, to put the highlighted move at the end.
  // This forces it to render on top (SVG doesn't have any z-index equivalent).
  // We need to do this to the underlying array rather than just rendering a
  // separate element for the highlighted move at the end. With the latter, the
  // element gets deleted and re-added by react when highlighting/unhighlighting,
  // which makes it impossible to drag.
  const [highlightedMoveId] = useHighlight("move");
  const movesRenderOrder = useMemo(
    () =>
      highlightedMoveId
        ? [...moves].sort(
            // Sort the highlighted move at the end
            comparator((move) =>
              move.id === highlightedMoveId
                ? Number.MAX_SAFE_INTEGER
                : move.order
            )
          )
        : moves,
    [moves, highlightedMoveId]
  );
  const stance = useStance(beta.moves);
  const { selectFirst: selectFirstStance } = useStanceControls(beta.moves);

  // Pre-select first stance in the beta.  We only want to do this when first
  // loading a beta. `selectFirstStance` will change whenever we
  // add/change/delete a move, but we don't want to constantly re-select the
  // first stance in those cases
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(selectFirstStance, [beta.id]);

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
      <StickFigure betaMoveConnectionKey={beta.moves} />

      {/* Draw the actual move marks. We want to render the highlighted move
          on top, which we can only do in SVG via ordering, so we need to make
          sure that's rendered last */}
      {movesRenderOrder.map((move) => (
        <BetaChainMark
          key={move.id}
          betaMoveKey={move}
          isInCurrentStance={Object.values(stance).includes(move.id)}
        />
      ))}
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
