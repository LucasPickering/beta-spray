import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { BetaList_problemNode$key } from "./__generated__/BetaList_problemNode.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";

interface Props {
  problemKey: BetaList_problemNode$key;
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string) => void;
}

/**
 * List all the betas for a problem
 */
const BetaList: React.FC<Props> = ({
  problemKey,
  selectedBeta,
  setSelectedBeta,
}) => {
  const problem = useFragment(
    graphql`
      fragment BetaList_problemNode on ProblemNode {
        id
        betas {
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
    problemKey
  );
  const connections = [problem.betas.__id];

  // TODO handle loading states
  const [createBeta] = useMutation<BetaList_createBetaMutation>(graphql`
    mutation BetaList_createBetaMutation(
      $input: CreateBetaMutationInput!
      $connections: [ID!]!
    ) {
      createBeta(input: $input) {
        beta
          @appendNode(connections: $connections, edgeTypeName: "BetaNodeEdge") {
          id
          name
        }
      }
    }
  `);

  return (
    <div>
      <h2>Beta</h2>
      {problem.betas.edges.map(({ node }) => {
        const id = `beta-${node.id}`;
        return (
          <div key={node.id}>
            <label htmlFor={id}>
              <input
                type="radio"
                id={id}
                value={selectedBeta}
                checked={selectedBeta === node.id}
                onChange={() => setSelectedBeta(node.id)}
              />
              {node.name}
            </label>
          </div>
        );
      })}

      <button
        onClick={() =>
          createBeta({
            variables: {
              input: {
                problemId: problem.id,
                name: `Beta ${problem.betas.edges.length + 1}`,
              },
              connections,
            },
          })
        }
      >
        New Beta
      </button>
    </div>
  );
};

export default BetaList;
