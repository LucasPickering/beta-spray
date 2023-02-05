import { useMemo } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaEditor_betaNode$key } from "./__generated__/BetaEditor_betaNode.graphql";
import { assertIsDefined, groupBy } from "util/func";
import StickFigure from "./StickFigure";
import BetaChainLine from "./BetaChainLine";
import BetaChainMark from "./BetaChainMark";
import { withQuery } from "relay-query-wrapper";
import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "components/Editor/queries";
import { BetaContext } from "components/Editor/util/context";
import { comparator } from "util/func";
import { useHighlight } from "components/Editor/util/highlight";
import { useStance, useStanceControls } from "components/Editor/util/stance";
import { BetaEditor_appendBetaMoveMutation } from "./__generated__/BetaEditor_appendBetaMoveMutation.graphql";
import useMutation from "util/useMutation";
import { BetaEditor_insertBetaMoveMutation } from "./__generated__/BetaEditor_insertBetaMoveMutation.graphql";
import { BetaEditor_updateBetaMoveMutation } from "./__generated__/BetaEditor_updateBetaMoveMutation.graphql";
import { DragFinishHandler } from "components/Editor/util/dnd";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import {
  getBetaMoveColors,
  getBetaMoveVisualPositions,
} from "components/Editor/util/moves";

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

  // These mutations are all for modifying moves, since they get called when
  // a move is dropped *onto* a hold/drop zone
  //
  // Append new move to end of the beta
  const { commit: appendBetaMove, state: appendBetaMoveState } =
    useMutation<BetaEditor_appendBetaMoveMutation>(graphql`
      mutation BetaEditor_appendBetaMoveMutation(
        $input: AppendBetaMoveMutationInput!
      ) {
        appendBetaMove(input: $input) {
          betaMove {
            id
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);
  // Insert a new move into the middle of the beta
  const { commit: insertBetaMove, state: insertBetaMoveState } =
    useMutation<BetaEditor_insertBetaMoveMutation>(graphql`
      mutation BetaEditor_insertBetaMoveMutation(
        $input: InsertBetaMoveMutationInput!
      ) {
        insertBetaMove(input: $input) {
          betaMove {
            id
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);
  // Relocate an existing move
  const { commit: updateBetaMove, state: updateBetaMoveState } =
    useMutation<BetaEditor_updateBetaMoveMutation>(graphql`
      mutation BetaEditor_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            id
            # These are the only fields we modify
            # Yes, we need to refetch both positions, in case the move was
            # converted from free to attached or vice versa
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
          }
        }
      }
    `);

  // Just a little helper, since we access this a lot. Technically it's wasted
  // space since we never access this array directly, just map over it again,
  // but who cares code is for people.
  const moves = useMemo(
    () => beta.moves.edges.map((edge) => edge.node),
    [beta.moves.edges]
  );

  // Calculate some derived data based on the full list of moves.
  const movesByBodyPart = useMemo(
    // Group the moves by body part so we can draw chains. We assume the API
    // response is ordered by `order`, so these should naturally be as well.
    () => groupBy(moves, (move) => move.bodyPart),
    [moves]
  );
  // Memoize these together to prevent re-renders in the context below
  const betaContextValue = useMemo(
    () => ({
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
  const { select: selectStance } = useStanceControls(beta.moves);

  const onDragFinish: DragFinishHandler<"overlayBetaMove"> = (item, result) => {
    // Regardless of the mutation kind, we'll pass either `holdId` OR `position`
    // (but not both), based on the drop target.
    const mutationParams =
      result.kind === "hold"
        ? { holdId: result.holdId }
        : { position: result.position };
    switch (item.action) {
      // Dragged a body part from the stick figure
      case "create":
        appendBetaMove({
          variables: {
            input: {
              betaId: beta.id,
              bodyPart: item.bodyPart,
              ...mutationParams,
            },
          },
          onCompleted(result) {
            // Update stance to include the new move
            assertIsDefined(result.appendBetaMove);
            selectStance(result.appendBetaMove.betaMove.id);
          },
          // Punting on optimistic update because ordering is hard
          // We could hypothetically add this, but we'd need to pipe down
          // the total number of moves so we can do n+1 here
        });
        break;
      // Dragged a line between two moves (insert after the starting move)
      case "insertAfter":
        insertBetaMove({
          variables: {
            input: {
              previousBetaMoveId: item.betaMoveId,
              ...mutationParams,
            },
          },
          onCompleted(result) {
            // Update stance to include the new move
            assertIsDefined(result.insertBetaMove);
            selectStance(result.insertBetaMove.betaMove.id);
          },
          // Punting on optimistic update because ordering is hard
        });
        break;
      // Dragged an existing move
      case "relocate":
        updateBetaMove({
          variables: {
            input: { betaMoveId: item.betaMoveId, ...mutationParams },
          },
          optimisticResponse: {
            updateBetaMove: {
              betaMove: {
                id: item.betaMoveId,
                // We'll set either `hold` or `position`, based on the move
                // being free/attached
                hold:
                  result.kind === "hold"
                    ? { id: result.holdId, position: result.position }
                    : null,
                position: result.kind === "dropZone" ? result.position : null,
              },
            },
          },
        });
    }
  };

  return (
    <BetaContext.Provider value={betaContextValue}>
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
      <StickFigure
        betaMoveConnectionKey={beta.moves}
        onDragFinish={onDragFinish}
      />

      {/* Draw the actual move marks. We want to render the highlighted move
          on top, which we can only do in SVG via ordering, so we need to make
          sure that's rendered last */}
      {movesRenderOrder.map((move) => (
        <BetaChainMark
          key={move.id}
          betaMoveKey={move}
          isInCurrentStance={stance[move.bodyPart] === move.id}
          onDragFinish={onDragFinish}
        />
      ))}

      <MutationErrorSnackbar
        message="Error adding move"
        state={appendBetaMoveState}
      />
      <MutationErrorSnackbar
        message="Error updating move"
        state={updateBetaMoveState}
      />
      <MutationErrorSnackbar
        message="Error adding move"
        state={insertBetaMoveState}
      />
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
