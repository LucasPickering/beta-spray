import React from "react";
import { graphql, useFragment } from "react-relay";
import { Box } from "rebass";
import { BetaDetails_betaNode$key } from "./__generated__/BetaDetails_betaNode.graphql";

interface Props {
  dataKey: BetaDetails_betaNode$key;
}

const BetaDetails: React.FC<Props> = ({ dataKey }) => {
  const data = useFragment(
    graphql`
      fragment BetaDetails_betaNode on BetaNode {
        id
        moves {
          edges {
            node {
              id
              bodyPart
              order
              hold {
                id
              }
            }
          }
        }
      }
    `,
    dataKey
  );

  return (
    <Box>
      <ol>
        {data.moves.edges.map(({ node }) => (
          <li key={node.id}>{node.bodyPart}</li>
        ))}
      </ol>
    </Box>
  );
};

export default BetaDetails;
