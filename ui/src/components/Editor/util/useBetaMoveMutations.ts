import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { isDefined } from "util/func";
import useMutation, { MutationState } from "util/useMutation";
import { DropResult } from "./dnd";
import { useHighlightItem } from "./highlight";
import { deleteBetaMoveLocal } from "./moves";
import { useStanceControls } from "./stance";
import { BodyPart, OverlayPosition } from "./svg";
import { useBetaMoveMutations_appendBetaMoveMutation } from "./__generated__/useBetaMoveMutations_appendBetaMoveMutation.graphql";
import { useBetaMoveMutations_betaNode$key } from "./__generated__/useBetaMoveMutations_betaNode.graphql";
import { useBetaMoveMutations_deleteBetaMoveMutation } from "./__generated__/useBetaMoveMutations_deleteBetaMoveMutation.graphql";
import { useBetaMoveMutations_editBetaMoveMutation } from "./__generated__/useBetaMoveMutations_editBetaMoveMutation.graphql";
import { useBetaMoveMutations_insertBetaMoveMutation } from "./__generated__/useBetaMoveMutations_insertBetaMoveMutation.graphql";
import { useBetaMoveMutations_relocateBetaMoveMutation } from "./__generated__/useBetaMoveMutations_relocateBetaMoveMutation.graphql";

interface Mutation<T> {
  callback: (data: T) => void;
  state: MutationState;
}

interface EditingMove {
  readonly id: string;
  readonly order: number;
  readonly annotation: string;
}

/**
 * A helper for BetaEditor to encapsulate mutation callbacks. There are a lot
 * of these, so it's helpful to keep them in one place, separate from the visual
 * layout.
 */
function useBetaMoveMutations(betaKey: useBetaMoveMutations_betaNode$key): {
  append: Mutation<{
    bodyPart: BodyPart;
    dropResult: DropResult<"overlayBetaMove">;
  }>;
  insert: Mutation<{
    previousBetaMoveId: string;
    dropResult: DropResult<"overlayBetaMove">;
  }>;
  relocate: Mutation<{
    betaMoveId: string;
    dropResult: DropResult<"overlayBetaMove">;
  }>;
  edit: Mutation<{ betaMoveId: string; annotation: string }> & {
    editingMove: EditingMove | undefined;
    setEditingMove: React.Dispatch<
      React.SetStateAction<EditingMove | undefined>
    >;
  };
  delete: Mutation<{ betaMoveId: string }>;
} {
  const beta = useFragment(
    graphql`
      fragment useBetaMoveMutations_betaNode on BetaNode {
        id
        moves {
          __id
          ...stance_betaMoveNodeConnection
          edges {
            node {
              id
              order
              isStart
              isLastInChain
            }
          }
        }
      }
    `,
    betaKey
  );

  const [, highlightMove] = useHighlightItem("move", beta.moves);
  const { select: selectStance } = useStanceControls(beta.moves);
  // State field for the Editing modal. We store this here so we can call the
  // setter in onCompleted
  const [editingMove, setEditingMove] = useState<EditingMove>();

  // Append new move to end of the beta
  const { commit: appendBetaMove, state: appendBetaMoveState } =
    useMutation<useBetaMoveMutations_appendBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_appendBetaMoveMutation(
        $input: AppendBetaMoveMutationInput!
        $connections: [ID!]!
      ) {
        appendBetaMove(input: $input) {
          betaMove
            @appendNode(
              connections: $connections
              edgeTypeName: "BetaMoveNodeEdge"
            ) {
            id
            ...useBetaMoveMutations_all_betaMoveNode
          }
        }
      }
    `);
  // Insert a new move into the middle of the beta
  const { commit: insertBetaMove, state: insertBetaMoveState } =
    useMutation<useBetaMoveMutations_insertBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_insertBetaMoveMutation(
        $input: InsertBetaMoveMutationInput!
      ) {
        insertBetaMove(input: $input) {
          # We DON'T need appendNode here since we refetch the full list below.
          # Relay will automatically merge the fields for the new node into the
          # updated connection.
          betaMove {
            id
            # Get all used fields for the new move
            ...useBetaMoveMutations_all_betaMoveNode
            # Refetch a minimal version of the full list, since moves could
            # have been reordered
            beta {
              id
              moves {
                edges {
                  node {
                    id
                    # These are the fields that can change during a reorder
                    order
                    isStart
                    isLastInChain
                  }
                }
              }
            }
          }
        }
      }
    `);
  // Relocate an existing move
  const { commit: relocateBetaMove, state: relocateBetaMoveState } =
    useMutation<useBetaMoveMutations_relocateBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_relocateBetaMoveMutation(
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
  // Modify annotation on a move. Even though this calls the same mutation as
  // `relocate`, the response is very different
  const { commit: editBetaMove, state: editBetaMoveState } =
    useMutation<useBetaMoveMutations_editBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_editBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            id
            annotation
          }
        }
      }
    `);
  // Delete a move
  const { commit: deleteBetaMove, state: deleteBetaMoveState } =
    useMutation<useBetaMoveMutations_deleteBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_deleteBetaMoveMutation(
        $input: DeleteBetaMoveMutationInput!
      ) {
        deleteBetaMove(input: $input) {
          betaMove {
            # This can reorder moves, so we have to refetch the whole move list
            beta {
              id
              moves {
                edges {
                  node {
                    id
                    # These are the fields that can change after a delete
                    order
                    isStart
                    isLastInChain
                  }
                }
              }
            }
          }
        }
      }
    `);

  return {
    append: {
      callback: ({ bodyPart, dropResult }) => {
        appendBetaMove({
          variables: {
            input: {
              betaId: beta.id,
              bodyPart,
              ...getDropParams(dropResult),
            },
            connections: [beta.moves.__id],
          },
          onCompleted(data) {
            if (isDefined(data.appendBetaMove)) {
              selectStance(data.appendBetaMove.betaMove.id);
            }
          },
          // Punting on optimistic update because ordering is hard
        });
      },
      state: appendBetaMoveState,
    },
    insert: {
      callback: ({ previousBetaMoveId, dropResult }) => {
        insertBetaMove({
          variables: {
            input: { previousBetaMoveId, ...getDropParams(dropResult) },
          },
          onCompleted(result) {
            // Update stance to include the new move
            if (isDefined(result.insertBetaMove)) {
              selectStance(result.insertBetaMove.betaMove.id);
            }
          },
          // Punting on optimistic update because ordering is hard
        });
      },
      state: insertBetaMoveState,
    },
    relocate: {
      callback: ({ betaMoveId, dropResult }) => {
        relocateBetaMove({
          variables: {
            input: { betaMoveId, ...getDropParams(dropResult) },
          },
          optimisticResponse: {
            updateBetaMove: {
              betaMove: {
                id: betaMoveId,
                ...getDropResponse(dropResult),
              },
            },
          },
        });
      },
      state: relocateBetaMoveState,
    },
    edit: {
      callback: ({ betaMoveId, annotation }) => {
        editBetaMove({
          variables: {
            input: { betaMoveId, annotation },
          },
          optimisticResponse: {
            updateBetaMove: {
              betaMove: { id: betaMoveId, annotation },
            },
          },
          onCompleted(data) {
            if (isDefined(data.updateBetaMove)) {
              // Close the modal
              setEditingMove(undefined);
            }
          },
        });
      },
      state: editBetaMoveState,
      editingMove,
      setEditingMove,
    },
    delete: {
      callback: ({ betaMoveId }) => {
        deleteBetaMove({
          variables: {
            input: { betaMoveId },
          },
          // Reset selection to prevent ghost highlight
          onCompleted() {
            highlightMove(undefined);
          },
          optimisticResponse: {
            deleteBetaMove: {
              betaMove: {
                id: betaMoveId,
                beta: {
                  id: beta.id,
                  moves: deleteBetaMoveLocal(beta.moves, betaMoveId),
                },
              },
            },
          },
        });
      },
      state: deleteBetaMoveState,
    },
  };
}

/**
 * A shorthand fragment to refetching all fields on a new beta move. This should
 * be spread in the response of any mutation that adds a new move. This captures
 * all the fields that we use throughout the UI.
 */
graphql`
  fragment useBetaMoveMutations_all_betaMoveNode on BetaMoveNode {
    id
    bodyPart
    order
    annotation
    isStart
    isLastInChain
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
`;

/**
 * Get a set of common parameters for a move mutation, related to the object it
 * was dropped onto.
 * @param dropResult Object that the move was dropped onto to trigger the mutation (hold or free?)
 * @returns Params to be passed to a move mutation
 */
function getDropParams(
  dropResult: DropResult<"overlayBetaMove">
): { holdId: string } | { position: OverlayPosition } {
  switch (dropResult.kind) {
    case "hold":
      return { holdId: dropResult.holdId };
    case "dropZone":
      return { position: dropResult.position };
  }
}

/**
 * Get a set of common response fields for a move mutation, related to the
 * object it was dropped onto. These can be used for an optimistic response.
 * @param dropResult Object that the move was dropped onto to trigger the mutation (hold or free?)
 * @returns Params to be passed to a move mutation
 */
function getDropResponse(
  dropResult: DropResult<"overlayBetaMove">
):
  | { hold: { id: string; position: OverlayPosition }; position: null }
  | { hold: null; position: OverlayPosition } {
  switch (dropResult.kind) {
    case "hold":
      return {
        hold: { id: dropResult.holdId, position: dropResult.position },
        position: null,
      };
    case "dropZone":
      return { hold: null, position: dropResult.position };
  }
}

export default useBetaMoveMutations;
