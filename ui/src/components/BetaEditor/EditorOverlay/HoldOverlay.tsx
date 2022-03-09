import React from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { useOverlayUtils } from "util/useOverlayUtils";
import HoldMarker from "./HoldMarker";
import { HoldOverlay_createHoldMutation } from "./__generated__/HoldOverlay_createHoldMutation.graphql";
import { HoldOverlay_deleteHoldMutation } from "./__generated__/HoldOverlay_deleteHoldMutation.graphql";
import { HoldOverlay_imageNode$key } from "./__generated__/HoldOverlay_imageNode.graphql";
import { HoldOverlay_problemNode$key } from "./__generated__/HoldOverlay_problemNode.graphql";

interface Props {
  imageKey: HoldOverlay_imageNode$key;
  problemKey: HoldOverlay_problemNode$key | null;
  editing: boolean;
}

/**
 * Visualization of holds onto the boulder image
 */
const HoldOverlay: React.FC<Props> = ({ imageKey, problemKey, editing }) => {
  const image = useFragment(
    graphql`
      fragment HoldOverlay_imageNode on BoulderImageNode {
        id
        holds {
          __id
          edges {
            node {
              id
              positionX
              positionY
            }
          }
        }
      }
    `,
    imageKey
  );
  const problem = useFragment(
    graphql`
      fragment HoldOverlay_problemNode on ProblemNode {
        id
        holds {
          __id
        }
      }
    `,
    problemKey
  );
  const connections = [image.holds.__id];
  if (problem) {
    connections.push(problem.holds.__id);
  }

  const { toOverlayPosition, toAPIPosition, getMouseCoords } =
    useOverlayUtils();

  // TODO handle loading states
  const [createHold] = useMutation<HoldOverlay_createHoldMutation>(graphql`
    mutation HoldOverlay_createHoldMutation(
      $input: CreateHoldMutationInput!
      $connections: [ID!]!
    ) {
      createHold(input: $input) {
        hold
          @appendNode(connections: $connections, edgeTypeName: "HoldNodeEdge") {
          # TODO fragment
          id
          positionX
          positionY
        }
      }
    }
  `);

  const [deleteHold] = useMutation<HoldOverlay_deleteHoldMutation>(graphql`
    mutation HoldOverlay_deleteHoldMutation(
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

      {image.holds.edges.map(({ node }) => {
        const position = toOverlayPosition(node);
        return (
          <HoldMarker
            key={node.id}
            holdId={node.id}
            position={position}
            onDoubleClick={
              editing
                ? () => {
                    deleteHold({
                      variables: {
                        input: { holdId: node.id },
                        connections,
                      },
                    });
                  }
                : undefined
            }
          />
        );
      })}
    </>
  );
};

export default HoldOverlay;
