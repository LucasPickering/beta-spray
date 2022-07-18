import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import useMutation from "util/useMutation";
import HoldEditorDropZone from "./HoldEditorDropZone";
import HoldOverlay from "./HoldOverlay";
import { HoldEditor_createHoldMutation } from "./__generated__/HoldEditor_createHoldMutation.graphql";
import { HoldEditor_deleteHoldMutation } from "./__generated__/HoldEditor_deleteHoldMutation.graphql";
import { HoldEditor_problemNode$key } from "./__generated__/HoldEditor_problemNode.graphql";
import { HoldEditor_relocateHoldMutation } from "./__generated__/HoldEditor_relocateHoldMutation.graphql";

interface Props {
  problemKey: HoldEditor_problemNode$key;
}

/**
 * A smart component for editing holds in an image or problem.
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

  return (
    <>
      {/* Invisible layer to capture clicks for new holds */}
      <HoldEditorDropZone
        // Drag and drop = move or create hold
        onDrop={(item, result) => {
          // If the dragged hold has an ID, that means it's an existing hold,
          // so move it. If not, it's a new hold from the palette.
          if (item.holdId) {
            relocateHold({
              variables: {
                input: { holdId: item.holdId, position: result.position },
              },
              optimisticResponse: {
                relocateHold: {
                  hold: { id: item.holdId, position: result.position },
                },
              },
            });
          } else {
            createHold({
              variables: {
                input: {
                  boulderId: problem.boulder.id,
                  problemId: problem.id,
                  position: result.position,
                },
                // *Don't* add to the image, just to the problem
                connections: [problem.holds.__id],
              },
              optimisticResponse: {
                createHold: {
                  hold: { id: "", position: result.position },
                },
              },
            });
          }
        }}
      />

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
        // Drag and drop = move hold
        onDrop={(item, result) => {
          if (item.holdId) {
            relocateHold({
              variables: {
                input: { holdId: item.holdId, position: result.position },
              },
              optimisticResponse: {
                relocateHold: {
                  hold: { id: item.holdId, position: result.position },
                },
              },
            });
          } else {
            createHold({
              variables: {
                input: {
                  boulderId: problem.boulder.id,
                  problemId: problem.id,
                  position: result.position,
                },
                // *Don't* add to the image, just to the problem
                connections: [problem.holds.__id],
              },
              optimisticResponse: {
                createHold: {
                  hold: { id: "", position: result.position },
                },
              },
            });
          }
        }}
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
    </>
  );
};

export default HoldEditor;
