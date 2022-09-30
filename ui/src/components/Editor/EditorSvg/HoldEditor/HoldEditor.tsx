import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { DropHandler, getItemWithKind } from "util/dnd";
import useMutation from "util/useMutation";
import HoldEditorDropZone from "./HoldEditorDropZone";
import HoldOverlay from "./HoldOverlay";
import { HoldEditor_appendBetaMoveMutation } from "./__generated__/HoldEditor_appendBetaMoveMutation.graphql";
import { HoldEditor_createHoldMutation } from "./__generated__/HoldEditor_createHoldMutation.graphql";
import { HoldEditor_deleteHoldMutation } from "./__generated__/HoldEditor_deleteHoldMutation.graphql";
import { HoldEditor_insertBetaMoveMutation } from "./__generated__/HoldEditor_insertBetaMoveMutation.graphql";
import { HoldEditor_problemNode$key } from "./__generated__/HoldEditor_problemNode.graphql";
import { HoldEditor_relocateHoldMutation } from "./__generated__/HoldEditor_relocateHoldMutation.graphql";
import { HoldEditor_updateBetaMoveMutation } from "./__generated__/HoldEditor_updateBetaMoveMutation.graphql";

interface Props {
  problemKey: HoldEditor_problemNode$key;
}

/**
 * A smart component for editing holds in an image or problem. This ALSO
 * handles mutation logic for moves, because the drop target is either the
 * hold drop zone, or individual holds.
 */
const HoldEditor: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment HoldEditor_problemNode on ProblemNode {
        id
        boulder {
          id
        }
        holds {
          __id
          ...HoldOverlay_holdConnection
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    problemKey
  );

  const { commit: createHold, state: createState } =
    useMutation<HoldEditor_createHoldMutation>(graphql`
      mutation HoldEditor_createHoldMutation(
        $input: CreateHoldMutationInput!
        $connections: [ID!]!
      ) {
        createHold(input: $input) {
          hold
            @appendNode(
              connections: $connections
              edgeTypeName: "HoldNodeEdge"
            ) {
            ...HoldMark_holdNode
          }
        }
      }
    `);
  const { commit: relocateHold, state: relocateState } =
    useMutation<HoldEditor_relocateHoldMutation>(graphql`
      mutation HoldEditor_relocateHoldMutation(
        $input: RelocateHoldMutationInput!
      ) {
        relocateHold(input: $input) {
          hold {
            id # So relay knows how to update this node locally
            ...HoldMark_holdNode
          }
        }
      }
    `);
  const { commit: deleteHold, state: deleteState } =
    useMutation<HoldEditor_deleteHoldMutation>(graphql`
      mutation HoldEditor_deleteHoldMutation(
        $input: DeleteHoldMutationInput!
        $connections: [ID!]!
      ) {
        deleteHold(input: $input) {
          hold {
            id @deleteEdge(connections: $connections) @deleteRecord
          }
        }
      }
    `);

  // These mutations are all for modifying moves, since they get called when
  // a move is dropped *onto* a hold/drop zone
  //
  // Append new move to end of the beta
  const { commit: appendBetaMove, state: appendState } =
    useMutation<HoldEditor_appendBetaMoveMutation>(graphql`
      mutation HoldEditor_appendBetaMoveMutation(
        $input: AppendBetaMoveMutationInput!
      ) {
        appendBetaMove(input: $input) {
          betaMove {
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);
  // Insert a new move into the middle of the beta
  const { commit: insertBetaMove, state: insertState } =
    useMutation<HoldEditor_insertBetaMoveMutation>(graphql`
      mutation HoldEditor_insertBetaMoveMutation(
        $input: InsertBetaMoveMutationInput!
      ) {
        insertBetaMove(input: $input) {
          betaMove {
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);
  // Relocate an existing move
  const { commit: updateBetaMove, state: updateState } =
    useMutation<HoldEditor_updateBetaMoveMutation>(graphql`
      mutation HoldEditor_updateBetaMoveMutation(
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

  /**
   * Callback when a dnd item is dropped on the drop zone (which covers the
   * whole image). The drop item can be a hold OR a move (in which case the move
   * is free).
   */
  const onDropZoneDrop: DropHandler<
    "overlayHold" | "overlayBetaMove",
    "dropZone"
  > = (_, result, monitor) => {
    const itemWithKind = getItemWithKind<"overlayHold" | "overlayBetaMove">(
      monitor
    );

    const position = result.position;

    switch (itemWithKind.kind) {
      // Hold was dropped
      case "overlayHold": {
        const item = itemWithKind.item;
        // Apply mutation based on what type of hold was being dragged - existing or new?
        switch (item.action) {
          case "create":
            createHold({
              variables: {
                input: {
                  boulderId: problem.boulder.id,
                  problemId: problem.id,
                  position,
                },
                // We only need to add to the problem holds here, because the
                // boulder holds aren't accessed directly in the UI
                connections: [problem.holds.__id],
              },
              // We'll create a phantom hold with no ID until the real one
              // comes in
              optimisticResponse: {
                createHold: { hold: { id: "", position } },
              },
            });
            break;
          case "relocate":
            relocateHold({
              variables: {
                input: { holdId: item.holdId, position },
              },
              optimisticResponse: {
                relocateHold: { hold: { id: item.holdId, position } },
              },
            });
            break;
        }
        break;
      }

      // Move was dropped
      case "overlayBetaMove": {
        const item = itemWithKind.item;
        switch (item.action) {
          // Dragged a body part from the palette
          case "create":
            appendBetaMove({
              variables: {
                input: {
                  betaId: item.betaId,
                  bodyPart: item.bodyPart,
                  position,
                },
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
                  position,
                },
              },
              // Punting on optimistic update because ordering is hard
            });
            break;
          // Dragged an existing move
          case "relocate":
            updateBetaMove({
              variables: {
                input: { betaMoveId: item.betaMoveId, position },
              },
              optimisticResponse: {
                updateBetaMove: {
                  betaMove: { id: item.betaMoveId, hold: null, position },
                },
              },
            });
        }
      }
    }
  };

  const onHoldDrop: DropHandler<"overlayBetaMove", "hold"> = (
    item,
    { holdId, position }
  ) => {
    switch (item.action) {
      // Dragged a body part from the palette
      case "create":
        appendBetaMove({
          variables: {
            input: {
              betaId: item.betaId,
              bodyPart: item.bodyPart,
              holdId,
            },
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
              holdId,
            },
          },
          // Punting on optimistic update because ordering is hard
        });
        break;
      // Dragged an existing move
      case "relocate":
        updateBetaMove({
          variables: {
            input: { betaMoveId: item.betaMoveId, holdId },
          },
          optimisticResponse: {
            updateBetaMove: {
              betaMove: {
                id: item.betaMoveId,
                // Move is attached - position comes indirectly from the hold
                hold: { id: holdId, position },
                position: null,
              },
            },
          },
        });
    }
  };

  return (
    <>
      {/* Invisible layer to capture holds being dropped */}
      <HoldEditorDropZone onDrop={onDropZoneDrop} />

      {/* Overlay goes on top of the drop zones so holds are clickable */}
      <HoldOverlay
        // Always render all holds, but if we're editing a specific problem,
        // highlight those holds
        holdConnectionKey={problem.holds}
        // Double click = delete
        onDoubleClick={(holdId) => {
          deleteHold({
            variables: {
              input: { holdId },
              // Delete from everywhere possible
              connections: [problem.holds.__id],
            },
            optimisticResponse: {
              deleteHold: {
                hold: { id: holdId },
              },
            },
          });
        }}
        onDrop={onHoldDrop}
      />

      <MutationErrorSnackbar
        message="Error creating hold"
        state={createState}
      />
      <MutationErrorSnackbar
        message="Error moving hold"
        state={relocateState}
      />
      <MutationErrorSnackbar
        message="Error deleting hold"
        state={deleteState}
      />
      <MutationErrorSnackbar message="Error adding move" state={appendState} />
      <MutationErrorSnackbar
        message="Error updating move"
        state={updateState}
      />
      <MutationErrorSnackbar message="Error adding move" state={insertState} />
    </>
  );
};

export default HoldEditor;
