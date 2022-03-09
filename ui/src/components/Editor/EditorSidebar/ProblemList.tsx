import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { ProblemList_createProblemMutation } from "./__generated__/ProblemList_createProblemMutation.graphql";
import { ProblemList_imageNode$key } from "./__generated__/ProblemList_imageNode.graphql";

interface Props {
  imageKey: ProblemList_imageNode$key;
  selectedProblem: string | undefined;
  setSelectedProblem: (problemId: string) => void;
}

/**
 * List all problems for a boulder image
 */
const ProblemList: React.FC<Props> = ({
  imageKey,
  selectedProblem,
  setSelectedProblem,
}) => {
  const image = useFragment(
    graphql`
      fragment ProblemList_imageNode on BoulderImageNode {
        id
        problems {
          __id
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    imageKey
  );
  const connections = [image.problems.__id];

  // TODO handle loading states
  const [createProblem] =
    useMutation<ProblemList_createProblemMutation>(graphql`
      mutation ProblemList_createProblemMutation(
        $input: CreateProblemMutationInput!
        $connections: [ID!]!
      ) {
        createProblem(input: $input) {
          problem
            @appendNode(
              connections: $connections
              edgeTypeName: "ProblemNodeEdge"
            ) {
            id
            name
          }
        }
      }
    `);

  return (
    <div>
      <h3>Problems</h3>
      {image.problems.edges.map(({ node }) => (
        <div key={node.id}>
          <label htmlFor={`problem-${node.id}`}>
            <input
              type="radio"
              id={`problem-${node.id}`}
              value={selectedProblem}
              checked={selectedProblem === node.id}
              onChange={() => setSelectedProblem(node.id)}
            />
            {node.name}
          </label>
        </div>
      ))}

      <button
        onClick={() =>
          createProblem({
            variables: {
              input: {
                imageId: image.id,
                name: `Problem ${image.problems.edges.length + 1}`,
              },
              connections,
            },
          })
        }
      >
        New Problem
      </button>
    </div>
  );
};

export default ProblemList;
