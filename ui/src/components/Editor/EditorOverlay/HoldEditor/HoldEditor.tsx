import React from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { useOverlayUtils } from "util/useOverlayUtils";
import HoldOverlay from "./HoldOverlay";
import { HoldEditor_createHoldMutation } from "./__generated__/HoldEditor_createHoldMutation.graphql";
import { HoldEditor_deleteHoldMutation } from "./__generated__/HoldEditor_deleteHoldMutation.graphql";
import { HoldEditor_imageNode$key } from "./__generated__/HoldEditor_imageNode.graphql";
import { HoldEditor_problemNode$key } from "./__generated__/HoldEditor_problemNode.graphql";

interface Props {
  imageKey: HoldEditor_imageNode$key;
  problemKey: HoldEditor_problemNode$key | null;
  editing: boolean;
}

/**
 * A smart component for viewing holds, editing holds in an image, or editing
 * holds in a problem.
 */
const HoldEditor: React.FC<Props> = ({ imageKey, problemKey, editing }) => {
  const image = useFragment(
    graphql`
      fragment HoldEditor_imageNode on BoulderImageNode {
        id
        holds {
          __id
          ...HoldOverlay_holdConnection
        }
      }
    `,
    imageKey
  );
  const problem = useFragment(
    graphql`
      fragment HoldEditor_problemNode on ProblemNode {
        id
        holds {
          __id
          ...HoldOverlay_holdConnection
        }
      }
    `,
    problemKey
  );

  // We'll update each of these connections when adding/deleting a hold
  const connections = [image.holds.__id];
  if (problem) {
    connections.push(problem.holds.__id);
  }

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

  // TODO support drag+dropping nodes

  return (
    <>
      {/* Invisible layer to capture clicks for new holds */}
      {editing && (
        <rect
          width="100%"
          height="100%"
          opacity={0}
          onClick={(e) => {
            const apiPos = toAPIPosition(getMouseCoords(e));
            createHold({
              variables: {
                input: {
                  imageId: image.id,
                  ...apiPos,
                },
                connections,
              },
            });
          }}
        />
      )}

      <HoldOverlay
        // If a problem is selected+loaded, render its holds, otherwise
        // render all the holds for the image
        holdConnectionKey={problem ? problem.holds : image.holds}
        onDoubleClick={
          editing
            ? (holdId) => {
                deleteHold({
                  variables: {
                    input: { holdId },
                    connections,
                  },
                });
              }
            : undefined
        }
      />
    </>
  );
};

export default HoldEditor;
