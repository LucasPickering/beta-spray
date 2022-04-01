import React from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import HoldMarks from "./HoldMarks";
import { ProblemEditor_createProblemHoldMutation } from "./__generated__/ProblemEditor_createProblemHoldMutation.graphql";
import { ProblemEditor_deleteProblemHoldMutation } from "./__generated__/ProblemEditor_deleteProblemHoldMutation.graphql";
import { ProblemEditor_imageNode$key } from "./__generated__/ProblemEditor_imageNode.graphql";
import { ProblemEditor_problemNode$key } from "./__generated__/ProblemEditor_problemNode.graphql";

interface Props {
  imageKey: ProblemEditor_imageNode$key;
  problemKey: ProblemEditor_problemNode$key;
}

/**
 * Edit the holds in a problem. Holds can be togged on/off, but you must work
 * within the set of holds defined for the image.
 */
const ProblemEditor: React.FC<Props> = ({ imageKey, problemKey }) => {
  const image = useFragment(
    graphql`
      fragment ProblemEditor_imageNode on BoulderImageNode {
        id
        holds {
          __id
          ...HoldMarks_holdConnection
        }
      }
    `,
    imageKey
  );
  const problem = useFragment(
    graphql`
      fragment ProblemEditor_problemNode on ProblemNode {
        id
        holds {
          __id
          ...HoldMarks_holdConnection
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

  const [createProblemHold] =
    useMutation<ProblemEditor_createProblemHoldMutation>(graphql`
      mutation ProblemEditor_createProblemHoldMutation(
        $input: CreateProblemHoldMutationInput!
        $connections: [ID!]!
      ) {
        createProblemHold(input: $input) {
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

  const [deleteProblemHold] =
    useMutation<ProblemEditor_deleteProblemHoldMutation>(graphql`
      mutation ProblemEditor_deleteProblemHoldMutation(
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

  const problemHoldIds = problem?.holds.edges.map(({ node }) => node.id);

  return (
    <HoldMarks
      // Render all holds for the image, but highlight this problem
      holdConnectionKey={image.holds}
      highlightedHolds={problemHoldIds}
      onClick={(holdId) => {
        if (problemHoldIds.includes(holdId)) {
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
      }}
    />
  );
};

export default ProblemEditor;
