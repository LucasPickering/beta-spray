import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { ProblemList_createProblemMutation } from "./__generated__/ProblemList_createProblemMutation.graphql";
import { ProblemList_problemConnection$key } from "./__generated__/ProblemList_problemConnection.graphql";

interface Props {
  problemConnectionKey: ProblemList_problemConnection$key;
  imageId: string;
  selectedProblem: string | undefined;
  setSelectedProblem: (problemId: string) => void;
}

/**
 * Selection list of problems
 */
const ProblemList: React.FC<Props> = ({
  problemConnectionKey,
  imageId,
  selectedProblem,
  setSelectedProblem,
}) => {
  const problemConnection = useFragment(
    graphql`
      fragment ProblemList_problemConnection on ProblemNodeConnection {
        __id
        edges {
          node {
            id
          }
        }
      }
    `,
    problemConnectionKey
  );
  const connections = [problemConnection.__id];

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
            # TODO fragment
            id
          }
        }
      }
    `);

  return (
    <div>
      <h3>Problems</h3>
      {problemConnection.edges.map(({ node }, i) => (
        <div key={node.id}>
          <label htmlFor={`problem-${node.id}`}>
            <input
              type="radio"
              id={`problem-${node.id}`}
              value={selectedProblem}
              checked={selectedProblem === node.id}
              onChange={() => setSelectedProblem(node.id)}
            />
            Problem {i + 1}
          </label>
        </div>
      ))}

      <button
        onClick={() =>
          createProblem({ variables: { input: { imageId }, connections } })
        }
      >
        New Problem
      </button>
    </div>
  );
};

export default ProblemList;
