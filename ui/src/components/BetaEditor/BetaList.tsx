import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { BetaList_betaConnection$key } from "./__generated__/BetaList_betaConnection.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";

interface Props {
  betaConnectionKey: BetaList_betaConnection$key;
  problemId: string;
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string) => void;
}

/**
 * Selection list of betas
 */
const BetaList: React.FC<Props> = ({
  betaConnectionKey,
  problemId,
  selectedBeta,
  setSelectedBeta,
}) => {
  const betaConnection = useFragment(
    graphql`
      fragment BetaList_betaConnection on BetaNodeConnection {
        __id
        edges {
          node {
            id
          }
        }
      }
    `,
    betaConnectionKey
  );
  const connections = [betaConnection.__id];

  // TODO handle loading states
  const [createBeta] = useMutation<BetaList_createBetaMutation>(graphql`
    mutation BetaList_createBetaMutation(
      $input: CreateBetaMutationInput!
      $connections: [ID!]!
    ) {
      createBeta(input: $input) {
        beta
          @appendNode(connections: $connections, edgeTypeName: "BetaNodeEdge") {
          # TODO fragment
          id
        }
      }
    }
  `);

  return (
    <div>
      <h2>Beta</h2>
      {betaConnection.edges.map(({ node }, i) => {
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
              Beta {i + 1}
            </label>
          </div>
        );
      })}

      <button
        onClick={() =>
          createBeta({ variables: { input: { problemId }, connections } })
        }
      >
        New Beta
      </button>
    </div>
  );
};

export default BetaList;
