import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { Box, Button } from "rebass";
import { BetaDetails_betaNode$key } from "./__generated__/BetaDetails_betaNode.graphql";
import { BetaDetails_deleteBetaMoveMutation } from "./__generated__/BetaDetails_deleteBetaMoveMutation.graphql";

interface Props {
  dataKey: BetaDetails_betaNode$key;
}

const BetaDetails: React.FC<Props> = ({ dataKey }) => {
  const beta = useFragment(
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

  // TODO use loading state
  const [deleteBetaMove] =
    useMutation<BetaDetails_deleteBetaMoveMutation>(graphql`
      mutation BetaDetails_deleteBetaMoveMutation(
        $input: DeleteBetaMoveMutationInput!
      ) {
        deleteBetaMove(input: $input) {
          betaMove {
            id
          }
        }
      }
    `);

  return (
    <Box>
      <ol>
        {beta.moves.edges.map(({ node }) => (
          <li key={node.id}>
            <span>{node.bodyPart}</span>

            <Button
              onClick={() =>
                deleteBetaMove({
                  variables: { input: { betaMoveId: node.id } },
                })
              }
            >
              x
            </Button>
          </li>
        ))}
      </ol>
    </Box>
  );
};

export default BetaDetails;
