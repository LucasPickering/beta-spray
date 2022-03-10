import React, { useEffect, useState } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import BetaDetailsMove from "./BetaDetailsMove";
import {
  BetaDetails_betaNode$data,
  BetaDetails_betaNode$key,
} from "./__generated__/BetaDetails_betaNode.graphql";
import { BetaDetails_deleteBetaMoveMutation } from "./__generated__/BetaDetails_deleteBetaMoveMutation.graphql";
import classes from "./BetaDetails.scss";
import { Heading } from "@chakra-ui/react";

interface Props {
  dataKey: BetaDetails_betaNode$key;
}

type BetaMove = BetaDetails_betaNode$data["moves"]["edges"][0]["node"];

const BetaDetails: React.FC<Props> = ({ dataKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaDetails_betaNode on BetaNode {
        id
        moves {
          edges {
            node {
              id
              ...BetaDetailsMove_betaMoveNode
            }
          }
        }
      }
    `,
    dataKey
  );

  // Track moves in internal state so we can reorder them without constantly
  // saving to the API. We'll reorder on hover, then persist on drop.
  const [moves, setMoves] = useState<BetaMove[]>(() =>
    beta.moves.edges.map(({ node }) => node)
  );

  // Whenever the beta updates from the API, refresh the local state to match
  useEffect(() => {
    setMoves(beta.moves.edges.map(({ node }) => node));
  }, [beta.moves.edges]);

  // TODO use loading state
  const [deleteBetaMove] =
    useMutation<BetaDetails_deleteBetaMoveMutation>(graphql`
      mutation BetaDetails_deleteBetaMoveMutation(
        $input: DeleteBetaMoveMutationInput!
      ) {
        deleteBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaEditor_betaNode
            }
          }
        }
      }
    `);

  return (
    <div>
      <Heading size="md" as="h3">
        Moves
      </Heading>
      <ol className={classes.betaDetailsList}>
        {moves.map((node, oldIndex) => (
          <BetaDetailsMove
            key={node.id}
            dataKey={node}
            onReorder={(newIndex) => {
              setMoves((oldMoves) =>
                oldIndex < newIndex
                  ? // Move *down* the list (to a higher index)
                    [
                      // Everything before the old index
                      ...oldMoves.slice(0, oldIndex),
                      // Everything between old and new index
                      ...oldMoves.slice(oldIndex + 1, newIndex + 1),
                      // New position
                      oldMoves[oldIndex],
                      // Everything after the new index
                      ...oldMoves.slice(newIndex + 1),
                    ]
                  : // Move *up* the list (to a lower index)
                    [
                      // Everything before the new index
                      ...oldMoves.slice(0, newIndex),
                      // New position
                      oldMoves[oldIndex],
                      // Everything between new and old index
                      ...oldMoves.slice(newIndex + 1, oldIndex),
                      // Everything after old index
                      ...oldMoves.slice(oldIndex + 1),
                    ]
              );
            }}
            onDelete={() =>
              deleteBetaMove({
                variables: {
                  input: { betaMoveId: node.id },
                },
              })
            }
          />
        ))}
      </ol>
    </div>
  );
};

export default BetaDetails;
