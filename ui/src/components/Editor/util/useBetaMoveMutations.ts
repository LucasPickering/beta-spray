import useMutation, { MutationState } from "util/useMutation";
import { assertIsDefined, findNode, isDefined } from "util/func";
import { graphql, useFragment } from "react-relay";
import {
  ConnectionInterface,
  RecordProxy,
  generateUniqueClientID,
} from "relay-runtime";
import { useBetaMoveMutations_betaNode$key } from "./__generated__/useBetaMoveMutations_betaNode.graphql";
import { useBetaMoveMutations_createBetaMoveMutation } from "./__generated__/useBetaMoveMutations_createBetaMoveMutation.graphql";
import { useBetaMoveMutations_deleteBetaMoveMutation } from "./__generated__/useBetaMoveMutations_deleteBetaMoveMutation.graphql";
import { useBetaMoveMutations_relocateBetaMoveMutation } from "./__generated__/useBetaMoveMutations_relocateBetaMoveMutation.graphql";
import { useBetaMoveMutations_updateBetaMoveAnnotationMutation } from "./__generated__/useBetaMoveMutations_updateBetaMoveAnnotationMutation.graphql";
import { DropResult } from "./dnd";
import { useStanceControls } from "./stance";
import { BodyPart, OverlayPosition } from "./svg";
import { useBetaMoveMutations_reorderBetaMoveMutation } from "./__generated__/useBetaMoveMutations_reorderBetaMoveMutation.graphql";
import { useBetaMoveMutations_create_betaNode$key } from "./__generated__/useBetaMoveMutations_create_betaNode.graphql";
import { useBetaMoveMutations_reorder_betaNode$key } from "./__generated__/useBetaMoveMutations_reorder_betaNode.graphql";
import { useBetaMoveMutations_delete_betaNode$key } from "./__generated__/useBetaMoveMutations_delete_betaNode.graphql";
import { createBetaMoveLocal, reorderBetaMoveLocal } from "./moves";

interface Mutation<T> {
  callback: (data: T) => void;
  state: MutationState;
}

/**
 * A helper for BetaEditor and BetaMoveList to encapsulate mutation callbacks.
 * There are a lot of these, so it's helpful to keep them in one place,
 * separate from the visual layout.
 */
function useBetaMoveMutations(betaKey: useBetaMoveMutations_betaNode$key): {
  create: ReturnType<typeof useCreate>;
  updateAnnotation: ReturnType<typeof useUpdateAnnotation>;
  relocate: ReturnType<typeof useRelocate>;
  reorder: ReturnType<typeof useReorder>;
  delete: ReturnType<typeof useDelete>;
} {
  const beta = useFragment(
    graphql`
      fragment useBetaMoveMutations_betaNode on BetaNode {
        ...useBetaMoveMutations_create_betaNode
        ...useBetaMoveMutations_reorder_betaNode
        ...useBetaMoveMutations_delete_betaNode
      }
    `,
    betaKey
  );

  return {
    create: useCreate(beta),
    updateAnnotation: useUpdateAnnotation(),
    relocate: useRelocate(),
    reorder: useReorder(beta),
    delete: useDelete(beta),
  };
}

/**
 * Create a new move
 */
function useCreate(
  betaKey: useBetaMoveMutations_create_betaNode$key
): Mutation<{
  bodyPart: BodyPart;
  previousBetaMoveId?: string;
  dropResult: DropResult<"overlayBetaMove">;
}> {
  const beta = useFragment(
    graphql`
      fragment useBetaMoveMutations_create_betaNode on BetaNode {
        id
        moves {
          ...stance_betaMoveNodeConnection
          edges {
            node {
              id
              order
              isStart
            }
          }
        }
      }
    `,
    betaKey
  );
  const { commit: createBetaMove, state } =
    useMutation<useBetaMoveMutations_createBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_createBetaMoveMutation(
        $input: CreateBetaMoveInput!
      ) @raw_response_type {
        createBetaMove(input: $input) {
          # We DON'T need appendNode here since we refetch the full list below.
          # Relay will automatically merge the fields for the new node into the
          # updated connection.
          id
          order
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
  const { select: selectStance } = useStanceControls(beta.moves);

  return {
    callback: ({ bodyPart, previousBetaMoveId, dropResult }) => {
      const optimisticId = generateUniqueClientID();
      // Find the order of the previous move (if any), and we'll be +1
      const previousBetaMove = isDefined(previousBetaMoveId)
        ? findNode(beta.moves, previousBetaMoveId)
        : undefined;
      const newOrder = (previousBetaMove?.order ?? 0) + 1;

      createBetaMove({
        variables: {
          input: {
            beta: beta.id,
            previousBetaMove: previousBetaMoveId,
            bodyPart,
            ...getDropParams(dropResult),
          },
        },
        optimisticResponse: {
          createBetaMove: {
            id: optimisticId,
            order: newOrder,
            bodyPart,
            annotation: "",
            isStart: false, // Punting on calculating this for now
            target: getOptimisticTarget(dropResult),
            beta: {
              id: beta.id,
              moves: createBetaMoveLocal(beta.moves, optimisticId, newOrder),
            },
          },
        },
      });
      // Update stance optimistically (which is why we use order)
      selectStance(newOrder);
    },
    state,
  };
}

/**
 * Update annotation on an existing move
 */
function useUpdateAnnotation(): Mutation<{
  betaMoveId: string;
  annotation: string;
}> {
  const { commit: updateBetaMoveAnnotation, state } =
    useMutation<useBetaMoveMutations_updateBetaMoveAnnotationMutation>(graphql`
      mutation useBetaMoveMutations_updateBetaMoveAnnotationMutation(
        $input: UpdateBetaMoveInput!
      ) @raw_response_type {
        updateBetaMove(input: $input) {
          id
          annotation
        }
      }
    `);
  return {
    callback: ({ betaMoveId, annotation }) => {
      updateBetaMoveAnnotation({
        variables: { input: { id: betaMoveId, annotation } },
        optimisticResponse: {
          updateBetaMove: { id: betaMoveId, annotation },
        },
      });
    },
    state,
  };
}

/**
 * Change the target (hold or position) of an existing move
 */
function useRelocate(): Mutation<{
  betaMoveId: string;
  dropResult: DropResult<"overlayBetaMove">;
}> {
  const { commit: relocateBetaMove, state } =
    useMutation<useBetaMoveMutations_relocateBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_relocateBetaMoveMutation(
        $input: UpdateBetaMoveInput!
      ) @raw_response_type {
        updateBetaMove(input: $input) {
          id
          # These are the only fields we modify
          # Yes, we need to refetch both positions, in case the move was
          # converted from free to attached or vice versa
          target {
            __typename
            ... on HoldNode {
              id
              position {
                x
                y
              }
            }
            ... on SVGPosition {
              x
              y
            }
          }
        }
      }
    `);

  return {
    callback: ({ betaMoveId, dropResult }) => {
      relocateBetaMove({
        variables: {
          input: { id: betaMoveId, ...getDropParams(dropResult) },
        },
        optimisticResponse: {
          updateBetaMove: {
            id: betaMoveId,
            target: getOptimisticTarget(dropResult),
          },
        },
      });
    },
    state,
  };
}

/**
 * Change the order on a move. Surrounding moves will be ordered accordingly.
 */
function useReorder(
  betaKey: useBetaMoveMutations_reorder_betaNode$key
): Mutation<{ betaMoveId: string; newOrder: number }> {
  const beta = useFragment(
    graphql`
      fragment useBetaMoveMutations_reorder_betaNode on BetaNode {
        id
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
    `,
    betaKey
  );
  const { commit: reorderBetaMove, state } =
    useMutation<useBetaMoveMutations_reorderBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_reorderBetaMoveMutation(
        $input: UpdateBetaMoveInput!
      ) @raw_response_type {
        updateBetaMove(input: $input) {
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
    `);
  return {
    callback: ({ betaMoveId, newOrder }) =>
      reorderBetaMove({
        variables: {
          input: {
            id: betaMoveId,
            order: newOrder,
          },
        },
        optimisticResponse: {
          updateBetaMove: {
            id: betaMoveId,
            beta: {
              id: beta.id,
              moves: reorderBetaMoveLocal(beta.moves, betaMoveId, newOrder),
            },
          },
        },
      }),
    state,
  };
}

/**
 * Delete a move
 */
function useDelete(
  betaKey: useBetaMoveMutations_delete_betaNode$key
): Mutation<{ betaMoveId: string }> {
  const beta = useFragment(
    graphql`
      fragment useBetaMoveMutations_delete_betaNode on BetaNode {
        moves {
          __id
        }
      }
    `,
    betaKey
  );
  const { commit: deleteBetaMove, state } =
    useMutation<useBetaMoveMutations_deleteBetaMoveMutation>(graphql`
      mutation useBetaMoveMutations_deleteBetaMoveMutation(
        $input: NodeInput!
        $connections: [ID!]!
      ) @raw_response_type {
        deleteBetaMove(input: $input) {
          id @deleteEdge(connections: $connections) @deleteRecord
        }
      }
    `);

  return {
    callback: ({ betaMoveId }) => {
      deleteBetaMove({
        variables: {
          input: { id: betaMoveId },
          connections: [beta.moves.__id],
        },
        updater(store) {
          // Imperatively collapse the orders to fill in the gap of the
          // deleted node. You may want to try doing this by refetching the
          // entire beta instead, but the API returns the *old* beta for a
          // deleted move so that doesn't work.
          const { EDGES, NODE } = ConnectionInterface.get();
          const betaMoveConnection = store.get(beta.moves.__id);
          if (isDefined(betaMoveConnection)) {
            const edges = betaMoveConnection.getLinkedRecords(EDGES);
            assertIsDefined(edges);
            for (let i = 0; i < edges.length; i++) {
              const edge: RecordProxy<object> = edges[i];
              const node = edge.getLinkedRecord(NODE);
              assertIsDefined(node);
              node.setValue(i + 1, "order");
            }
          }
        },
      });
    },
    state,
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
    target {
      __typename
      ... on HoldNode {
        id
        position {
          x
          y
        }
      }
      ... on SVGPosition {
        x
        y
      }
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
 * Get an optimistic value for the `target` field, basd on the object it was
 * dropped onto.
 * @param dropResult Object that the move was dropped onto to trigger the mutation (hold or free?)
 * @returns Valid value for the `target` field
 */
function getOptimisticTarget(
  dropResult: DropResult<"overlayBetaMove">
): // These response types have some weird cruft because of the types that Relay generates :(
| {
      __typename: "HoldNode";
      __isNode: "HoldNode";
      id: string;
      position: OverlayPosition;
    }
  | ({
      __typename: "SVGPosition";
      __isNode: "SVGPosition";
      id: string;
    } & OverlayPosition) {
  switch (dropResult.kind) {
    case "hold":
      return {
        __typename: "HoldNode",
        __isNode: "HoldNode",
        id: dropResult.holdId,
        position: dropResult.position,
      };
    case "dropZone":
      return {
        __typename: "SVGPosition",
        __isNode: "SVGPosition",
        id: "",
        ...dropResult.position,
      };
  }
}

export default useBetaMoveMutations;
