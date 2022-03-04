import React from "react";
import { graphql, useFragment } from "react-relay";
import { BetaList_betaConnection$key } from "./__generated__/BetaList_betaConnection.graphql";

interface Props {
  dataKey: BetaList_betaConnection$key;
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string) => void;
}

/**
 * Selection list of betas
 */
const BetaList: React.FC<Props> = ({
  dataKey,
  selectedBeta,
  setSelectedBeta,
}) => {
  const data = useFragment(
    graphql`
      fragment BetaList_betaConnection on BetaNodeConnection {
        edges {
          node {
            id
          }
        }
      }
    `,
    dataKey
  );

  return (
    <div>
      {data.edges.map(({ node }, i) => {
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
    </div>
  );
};

export default BetaList;
