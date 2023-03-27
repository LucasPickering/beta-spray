import { graphql, useFragment } from "react-relay";
import { isDefined } from "util/func";
import useMutation, { MutationState } from "util/useMutation";
import { DropResult } from "./dnd";
import { useStanceControls } from "./stance";
import { BodyPart, OverlayPosition } from "./svg";
import { useBetaMoveMutations_createBetaMoveMutation } from "./__generated__/useBetaMoveMutations_createBetaMoveMutation.graphql";
import { useBetaMoveMutations_betaNode$key } from "./__generated__/useBetaMoveMutations_betaNode.graphql";
import { useBetaMoveMutations_updateBetaMoveMutation } from "./__generated__/useBetaMoveMutations_updateBetaMoveMutation.graphql";

interface Mutation<T> {
  callback: (data: T) => void;
  state: MutationState;
}

/**
 * A helper for BetaEditor to encapsulate mutation callbacks. There are a lot
 * of these, so it's helpful to keep them in one place, separate from the visual
 * layout.
 */
function useBetaMoveMutations(betaKey: useBetaMoveMutations_betaNode$key): {
  create: Mutation<{
    bodyPart: BodyPart;
    previousBetaMoveId?: string;
    dropResult: DropResult<"overlayBetaMove">;
  }>;
  relocate: Mutation<{
    betaMoveId: string;
    dropResult: DropResult<"overlayBetaMove">;
  }>;
} {
  const beta = useFragment(
    graphql`
      fragment useBetaMoveMutations_betaNode on BetaNode {
        id
        moves {
          ...stance_betaMoveNodeConnection
        }
      }
    `,
    betaKey
  );

  const { select: selectStance } = useStanceControls(beta.moves);

  // Append new move to end of the beta
  const { commit: createBetaMove, state: createBetaMoveState } =
    useMutation<useBetaMoveMutations_createBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_createBetaMoveMutation(
        $input: CreateBetaMoveInput!
      ) {
        createBetaMove(input: $input) {
          # We DON'T need appendNode here since we refetch the full list below.
          # Relay will automatically merge the fields for the new node into the
          # updated connection.
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
                }
              }
            }
          }
        }
      }
    `);
  // Relocate an existing move
  const { commit: updateBetaMove, state: updateBetaMoveState } =
    useMutation<useBetaMoveMutations_updateBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_updateBetaMoveMutation(
        $input: UpdateBetaMoveInput!
      ) @raw_response_type {
        updateBetaMove(input: $input) {
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
    `);

  return {
    create: {
      callback: ({ bodyPart, previousBetaMoveId, dropResult }) => {
        createBetaMove({
          variables: {
            input: {
              beta: beta.id,
              previousBetaMove: previousBetaMoveId,
              bodyPart,
              ...getDropParams(dropResult),
            },
          },
          onCompleted(data) {
            if (isDefined(data.createBetaMove)) {
              selectStance(data.createBetaMove.id);
            }
          },
          // Punting on optimistic update because ordering is hard
        });
      },
      state: createBetaMoveState,
    },
    relocate: {
      callback: ({ betaMoveId, dropResult }) => {
        updateBetaMove({
          variables: {
            input: { id: betaMoveId, ...getDropParams(dropResult) },
          },
          optimisticResponse: {
            updateBetaMove: {
              id: betaMoveId,
              ...getDropResponse(dropResult),
            },
          },
        });
      },
      state: updateBetaMoveState,
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
): { hold: string } | { position: OverlayPosition } {
  switch (dropResult.kind) {
    case "hold":
      return { hold: dropResult.holdId };
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
