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
import {
  getBetaMoveColors,
  getBetaMoveVisualPositions,
} from "components/Editor/util/svg";
import { BetaContext } from "components/Editor/util/context";
import { useStance, useStanceControls } from "components/Editor/util/stance";
import { BetaEditor_appendBetaMoveMutation } from "./__generated__/BetaEditor_appendBetaMoveMutation.graphql";
import useMutation from "util/useMutation";
import { BetaEditor_insertBetaMoveMutation } from "./__generated__/BetaEditor_insertBetaMoveMutation.graphql";
import { BetaEditor_updateBetaMoveMutation } from "./__generated__/BetaEditor_updateBetaMoveMutation.graphql";
import { DragFinishHandler } from "components/Editor/util/dnd";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";

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

      {/* Non-stance moves, then the stick figure, then stance moves */}
      {moves
        .filter((move) => stance[move.bodyPart] !== move.id)
        .map((move) => (
          <BetaChainMark
            key={move.id}
            betaMoveKey={move}
            isInCurrentStance={false}
            onDragFinish={onDragFinish}
          />
        ))}
      <StickFigure
        betaMoveConnectionKey={beta.moves}
        onDragFinish={onDragFinish}
      />
      {moves
        .filter((move) => stance[move.bodyPart] === move.id)
        .map((move) => (
          <BetaChainMark
            key={move.id}
            betaMoveKey={move}
            isInCurrentStance
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
