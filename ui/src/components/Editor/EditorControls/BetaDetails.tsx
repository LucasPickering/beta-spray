import { useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import BetaDetailsMove from "./BetaDetailsMove";
import { BetaDetails_betaNode$key } from "./__generated__/BetaDetails_betaNode.graphql";
import { BetaDetails_deleteBetaMoveMutation } from "./__generated__/BetaDetails_deleteBetaMoveMutation.graphql";
import { FormLabel, List, Skeleton, Typography } from "@mui/material";
import { BetaDetails_updateBetaMoveMutation } from "./__generated__/BetaDetails_updateBetaMoveMutation.graphql";
import { BetaContext } from "components/Editor/util/context";
import useMutation from "util/useMutation";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "../queries";
import { withQuery } from "relay-query-wrapper";
import {
  deleteBetaMoveLocal,
  useBetaMoveColors,
  reorderBetaMoveLocal,
} from "components/Editor/util/moves";
import BetaDetailsDragLayer from "./BetaDetailsDragLayer";
import { useStance } from "../util/stance";
import { findNodeIndex, isDefined, moveArrayElement } from "util/func";

interface Props {
  betaKey: BetaDetails_betaNode$key;
}

const BetaDetails: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaDetails_betaNode on BetaNode {
        id
        moves {
          ...BetaDetailsDragPreview_betaMoveNodeConnection
          ...moves_colors_betaMoveNodeConnection
          ...stance_betaMoveNodeConnection
          edges {
            node {
              id
              order
              isStart
              bodyPart
              ...BetaDetailsMove_betaMoveNode
            }
          }
        }
      }
    `,
    betaKey
  );

  // When reordering moves, we need to track temporary state of where the
  // dragged move is. We'll use this to reorder the moves locally. Once the
  // move is dropped, we'll persist changes to the DB
  const [draggingMove, setDraggingMove] = useState<{
    // Move being dragged
    id: string;
    // *Current* index, which changes as we drag around
    index: number;
  }>();

  // Calculate a local copy of the moves. This only differs if we're dragging,
  // in which case we'll reorder the moves to match the current drag state
  const moves = useMemo(() => {
    const moves = beta.moves.edges.map(({ node }) => node);
    if (isDefined(draggingMove)) {
      const oldIndex = findNodeIndex(beta.moves, draggingMove.id);
      if (oldIndex >= 0) {
        moveArrayElement(moves, oldIndex, draggingMove.index);
      }
    }
    return moves;
  }, [beta.moves, draggingMove]);

  // Whenever the beta updates from the API, clear dragging state
  useEffect(() => {
    setDraggingMove(undefined);
  }, [beta.moves.edges]);

  // We may want to memoize these together to prevent context-based rerenders:
  // Calculate color for each move
  const betaMoveColors = useBetaMoveColors(beta.moves);
  // We don't need positions in this list, so leave this empty. If we try
  // to access it within this tree, it'll just trigger an error
  const betaMoveVisualPositions = new Map();

  const stance = useStance(beta.moves);

  const { commit: updateBetaMove, state: updateState } =
    useMutation<BetaDetails_updateBetaMoveMutation>(graphql`
      mutation BetaDetails_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch all moves to get the new ordering
              moves {
                edges {
                  node {
                    id
                    order
                    isStart
                  }
                }
              }
            }
          }
        }
      }
    `);

  const { commit: deleteBetaMove, state: deleteState } =
    useMutation<BetaDetails_deleteBetaMoveMutation>(graphql`
      mutation BetaDetails_deleteBetaMoveMutation(
        $input: DeleteBetaMoveMutationInput!
      ) {
        deleteBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch all moves to get the new ordering
              moves {
                edges {
                  node {
                    id
                    order
                    isStart
                  }
                }
              }
            }
          }
        }
      }
    `);

  return (
    <BetaDetailsWrapper>
      <BetaContext.Provider value={{ betaMoveColors, betaMoveVisualPositions }}>
        {moves.length === 0 && (
          <Typography variant="body2">
            Drag a hand or foot to add a move
          </Typography>
        )}

        <List component="ol">
          {moves.map((node, moveIndex) => (
            <BetaDetailsMove
              key={node.id}
              betaMoveKey={node}
              index={moveIndex}
              isInCurrentStance={stance[node.bodyPart] === node.id}
              onReorder={(dragItem, newIndex) => {
                // This is called on the *hovered* move, so the passed item is
                // the one being dragged
                setDraggingMove({ id: dragItem.betaMoveId, index: newIndex });
              }}
              onDrop={(item) => {
                if (item) {
                  // The index field was modified during dragging, but
                  // index is 0-based and order is 1-based, so we need to
                  // convert now. The API will take care of sliding the
                  // other moves up/down to fit this one in
                  const newOrder = item.index + 1;
                  updateBetaMove({
                    variables: {
                      input: {
                        betaMoveId: item.betaMoveId,
                        order: newOrder,
                      },
                    },
                    optimisticResponse: {
                      updateBetaMove: {
                        betaMove: {
                          id: node.id,
                          beta: {
                            id: beta.id,
                            moves: reorderBetaMoveLocal(
                              beta.moves,
                              item.betaMoveId,
                              newOrder
                            ),
                          },
                        },
                      },
                    },
                  });
                }
                setDraggingMove(undefined);
              }}
              onDelete={() =>
                deleteBetaMove({
                  variables: {
                    input: { betaMoveId: node.id },
                  },
                  optimisticResponse: {
                    deleteBetaMove: {
                      betaMove: {
                        id: node.id,
                        beta: {
                          id: beta.id,
                          moves: deleteBetaMoveLocal(beta.moves, node.id),
                        },
                      },
                    },
                  },
                })
              }
            />
          ))}
        </List>

        <BetaDetailsDragLayer betaMoveConnectionKey={beta.moves} />
        <MutationErrorSnackbar
          message="Error updating move"
          state={updateState}
        />
        <MutationErrorSnackbar
          message="Error deleting move"
          state={deleteState}
        />
      </BetaContext.Provider>
    </BetaDetailsWrapper>
  );
};

/**
 * Wrapper with static content that allows for a fleshed out loading state.
 */
const BetaDetailsWrapper: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div>
    <FormLabel component="span">Moves</FormLabel>
    {children}
  </div>
);

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  fallbackElement: (
    <BetaDetailsWrapper>
      <Skeleton variant="rectangular" height={240} />
    </BetaDetailsWrapper>
  ),
})(BetaDetails);
