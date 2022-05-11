import MutationError from "components/common/MutationError";
import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import useMutation from "util/useMutation";
import { useOverlayUtils } from "util/svg";
import HoldEditorDropZone from "./HoldEditorDropZone";
import HoldOverlay from "./HoldOverlay";
import { HoldEditor_createHoldMutation } from "./__generated__/HoldEditor_createHoldMutation.graphql";
import { HoldEditor_deleteHoldMutation } from "./__generated__/HoldEditor_deleteHoldMutation.graphql";
import { HoldEditor_problemNode$key } from "./__generated__/HoldEditor_problemNode.graphql";
import { HoldEditor_updateHoldMutation } from "./__generated__/HoldEditor_updateHoldMutation.graphql";

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

  const { toAPIPosition, toSvgPosition } = useOverlayUtils();

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

  const { commit: updateHold, state: updateState } =
    useMutation<HoldEditor_updateHoldMutation>(graphql`
      mutation HoldEditor_updateHoldMutation($input: UpdateHoldMutationInput!) {
        updateHold(input: $input) {
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
        onClick={(e) => {
          const apiPos = toAPIPosition(
            toSvgPosition({ x: e.clientX, y: e.clientY })
          );
          createHold({
            variables: {
              input: {
                boulderId: problem.boulder.id,
                problemId: problem.id,
                ...apiPos,
              },
              // *Don't* add to the problem, just to the image
              connections: [problem.holds.__id],
            },
            optimisticResponse: {
              createHold: {
                hold: { id: "", ...apiPos },
              },
            },
          });
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
        // Darg and drop = move hold
        onDrop={(item, result) => {
          const apiPos = toAPIPosition(result.position);
          updateHold({
            variables: {
              input: { holdId: item.holdId, ...apiPos },
            },
            optimisticResponse: {
              updateHold: {
                hold: { id: item.holdId, ...apiPos },
              },
            },
          });
        }}
      />

      <MutationError message="Error creating hold" state={createState} />
      <MutationError message="Error updating hold" state={updateState} />
      <MutationError message="Error deleting hold" state={deleteState} />
    </>
  );
};

export default HoldEditor;
