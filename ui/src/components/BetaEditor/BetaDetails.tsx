import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { Box, Button } from "rebass";
import { BetaDetails_betaNode$key } from "./__generated__/BetaDetails_betaNode.graphql";
import { BetaDetails_createBetaHoldMutation } from "./__generated__/BetaDetails_createBetaHoldMutation.graphql";

interface Props {
  dataKey: BetaDetails_betaNode$key;
}

const BetaDetails: React.FC<Props> = ({ dataKey }) => {
  const data = useFragment(
    graphql`
      fragment BetaDetails_betaNode on BetaNode {
        id
        holds {
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

  const [createBetaHold, isCreateBetaHoldInFlight] =
    useMutation<BetaDetails_createBetaHoldMutation>(graphql`
      mutation BetaDetails_createBetaHoldMutation(
        $input: CreateBetaHoldMutationInput!
      ) {
        createBetaHold(input: $input) {
          betaHold {
            id
          }
        }
      }
    `);

  return (
    <Box>
      <ol>
        {data.holds.edges.map(({ node }) => (
          <li key={node.id}>{node.bodyPart}</li>
        ))}
      </ol>
      <Button>Add Hold</Button>
    </Box>
  );
};

export default BetaDetails;
