import React from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { useOverlayUtils } from "util/useOverlayUtils";
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
        image {
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

  const { toAPIPosition, getMouseCoords } = useOverlayUtils();

  // TODO handle loading states
  const [createHold] = useMutation<HoldEditor_createHoldMutation>(graphql`
    mutation HoldEditor_createHoldMutation(
      $input: CreateHoldMutationInput!
      $connections: [ID!]!
    ) {
      createHold(input: $input) {
        hold
          @appendNode(connections: $connections, edgeTypeName: "HoldNodeEdge") {
          ...HoldMarker_holdNode
        }
      }
    }
  `);

  const [updateHold] = useMutation<HoldEditor_updateHoldMutation>(graphql`
    mutation HoldEditor_updateHoldMutation($input: UpdateHoldMutationInput!) {
      updateHold(input: $input) {
        hold {
          id # So relay knows how to update this node locally
          ...HoldMarker_holdNode
        }
      }
    }
  `);

  const [deleteHold] = useMutation<HoldEditor_deleteHoldMutation>(graphql`
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
            getMouseCoords({ x: e.clientX, y: e.clientY })
          );
          createHold({
            variables: {
              input: {
                imageId: problem.image.id,
                problemId: problem.id,
                ...apiPos,
              },
              // *Don't* add to the problem, just to the image
              connections: [problem.holds.__id],
            },
          });
        }}
      />

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
          });
        }}
        // Darg and drop = move hold
        onDrop={(item, result) => {
          const apiPos = toAPIPosition(result.position);
          updateHold({
            variables: {
              input: { holdId: item.holdId, ...apiPos },
            },
          });
        }}
      />
    </>
  );
};

export default HoldEditor;
