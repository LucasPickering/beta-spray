import React from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { assertIsDefined } from "util/func";
import { useOverlayUtils } from "util/useOverlayUtils";
import HoldOverlay from "./HoldOverlay";
import { HoldEditor_createHoldMutation } from "./__generated__/HoldEditor_createHoldMutation.graphql";
import { HoldEditor_createProblemHoldMutation } from "./__generated__/HoldEditor_createProblemHoldMutation.graphql";
import { HoldEditor_deleteHoldMutation } from "./__generated__/HoldEditor_deleteHoldMutation.graphql";
import { HoldEditor_deleteProblemHoldMutation } from "./__generated__/HoldEditor_deleteProblemHoldMutation.graphql";
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

  const [createProblemHold] =
    useMutation<HoldEditor_createProblemHoldMutation>(graphql`
      mutation HoldEditor_createProblemHoldMutation(
        $input: CreateProblemHoldMutationInput!
        $connections: [ID!]!
      ) {
        createProblemHold(input: $input) {
          hold
            @appendNode(
              connections: $connections
              edgeTypeName: "HoldNodeEdge"
            ) {
            ...HoldMarker_holdNode
          }
        }
      }
    `);

  const [deleteProblemHold] =
    useMutation<HoldEditor_deleteProblemHoldMutation>(graphql`
      mutation HoldEditor_deleteProblemHoldMutation(
        $input: DeleteProblemHoldMutationInput!
        $connections: [ID!]!
      ) {
        deleteProblemHold(input: $input) {
          hold {
            id @deleteEdge(connections: $connections)
          }
        }
      }
    `);

  // TODO support drag+dropping nodes

  const problemHoldIds = problem?.holds.edges.map(({ node }) => node.id);

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
                // *Don't* add to the problem, just to the image
                connections: [image.holds.__id],
              },
            });
          }}
        />
      )}

      <HoldOverlay
        // If a problem is selected+loaded, render its holds, otherwise
        // render all the holds for the image. *But*, if we're editing, always
        // render all holds, so that we can show which holds are/aren't in the
        // problem.
        holdConnectionKey={problem && !editing ? problem.holds : image.holds}
        highlightedHolds={editing ? problemHoldIds : undefined}
        onClick={
          editing && problem
            ? (holdId) => {
                // problem is defined => problemHoldIds is defined
                assertIsDefined(problemHoldIds);
                if (problemHoldIds && problemHoldIds.includes(holdId)) {
                  // Hold is already in the problem, remove it
                  deleteProblemHold({
                    variables: {
                      input: { problemId: problem.id, holdId },
                      connections: [problem.holds.__id],
                    },
                  });
                } else {
                  // Hold is not yet in the problem, add it
                  createProblemHold({
                    variables: {
                      input: { problemId: problem.id, holdId },
                      // No need to update the image-level hold connection here
                      connections: [problem.holds.__id],
                    },
                  });
                }
              }
            : undefined
        }
        onDoubleClick={
          editing
            ? (holdId) => {
                deleteHold({
                  variables: {
                    input: { holdId },
                    // Delete from everywhere possible
                    connections: [image.holds.__id].concat(
                      problem ? [problem.holds.__id] : []
                    ),
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
