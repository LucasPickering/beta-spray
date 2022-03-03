import React, { useContext } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaOverlay_betaNode$key } from "./__generated__/BetaOverlay_betaNode.graphql";
import OverlayContext from "context/OverlayContext";
import { toD3Position, D3Position } from "util/d3";
import { BetaOverlay_createBetaMoveMutation } from "./__generated__/BetaOverlay_createBetaMoveMutation.graphql";
import BetaChain from "./BetaChain";
import { BodyPart } from "util/api";

interface Props {
  dataKey: BetaOverlay_betaNode$key;
}

/**
 * Visualization of holds onto the boulder image
 */
const BetaOverlay: React.FC<Props> = ({ dataKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaOverlay_betaNode on BetaNode {
        id
        problem {
          holds {
            edges {
              node {
                positionX
                positionY
              }
            }
          }
        }
        moves {
          edges {
            node {
              id
              bodyPart
              order
              hold {
                positionX
                positionY
              }
            }
          }
        }
      }
    `,
    dataKey
  );

  const { aspectRatio } = useContext(OverlayContext);
  // Group the moves by body part so we can draw chains. We assume the API
  // response is ordered by `order`, so these should naturally be as well.
  const movesByBodyPart = beta.moves.edges.reduce<
    Map<BodyPart, Array<{ betaMoveId: string; position: D3Position }>>
  >((acc, { node }) => {
    // TODO use position for non-hold moves
    if (!node.hold) {
      console.warn("skipping move (no associated hold)", node);
      return acc;
    }

    const moves = acc.get(node.bodyPart) ?? [];
    moves.push({
      betaMoveId: node.id,
      position: toD3Position(node.hold, aspectRatio),
    });
    acc.set(node.bodyPart, moves);
    return acc;
  }, new Map());

  // TODO use loading state
  const [createBetaMove] =
    useMutation<BetaOverlay_createBetaMoveMutation>(graphql`
      mutation BetaOverlay_createBetaMoveMutation(
        $input: CreateBetaMoveMutationInput!
      ) {
        createBetaMove(input: $input) {
          betaMove {
            id
          }
        }
      }
    `);

  // The `order` value of the next move to be created
  const nextOrder =
    Math.max(0, ...beta.moves.edges.map(({ node }) => node.order)) + 1;

  // Render one "chain" of moves per body part
  return (
    <>
      {Array.from(movesByBodyPart.entries(), ([bodyPart, moves]) => (
        <BetaChain
          key={bodyPart}
          bodyPart={bodyPart as BodyPart}
          moves={moves}
          createBetaMove={({ holdId }) =>
            createBetaMove({
              variables: {
                input: {
                  betaId: beta.id,
                  bodyPart: bodyPart as BodyPart,
                  order: nextOrder,
                  holdId,
                },
              },
            })
          }
        />
      ))}
    </>
  );
};

export default BetaOverlay;
