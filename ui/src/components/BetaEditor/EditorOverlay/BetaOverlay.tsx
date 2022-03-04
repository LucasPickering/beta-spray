import React, { useContext } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaOverlay_betaNode$key } from "./__generated__/BetaOverlay_betaNode.graphql";
import OverlayContext from "context/OverlayContext";
import { BetaOverlayMove, BodyPart } from "./types";
import { BetaOverlay_createBetaMoveMutation } from "./__generated__/BetaOverlay_createBetaMoveMutation.graphql";
import BetaChain from "./BetaChain";
import { toOverlayPosition } from "util/func";

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
          __id
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
    Map<BodyPart, Array<BetaOverlayMove>>
  >((acc, { node }) => {
    // TODO use position for non-hold moves
    if (!node.hold) {
      console.warn("skipping move (no associated hold)", node);
      return acc;
    }

    const moves = acc.get(node.bodyPart) ?? [];
    moves.push({
      kind: "saved",
      id: node.id,
      bodyPart: node.bodyPart,
      order: node.order,
      position: toOverlayPosition(node.hold, aspectRatio),
    });
    acc.set(node.bodyPart, moves);
    return acc;
  }, new Map());

  // Within each chain, link prev<==>current<==>next, so each move knows about
  // its neighbors
  for (const moves of movesByBodyPart.values()) {
    moves.forEach((move, i) => {
      move.prev = moves[i - 1];
      move.next = moves[i + 1];
    });
  }

  // TODO use loading state
  // TODO centralize all mutations so we don't need spaghetti update logic
  const [createBetaMove] =
    useMutation<BetaOverlay_createBetaMoveMutation>(graphql`
      mutation BetaOverlay_createBetaMoveMutation(
        $input: CreateBetaMoveMutationInput!
        $connections: [ID!]!
      ) {
        createBetaMove(input: $input) {
          betaMove
            @appendNode(
              connections: $connections
              edgeTypeName: "BetaMoveNodeEdge"
            ) {
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
          moves={moves}
          createBetaMove={({ holdId }) =>
            createBetaMove({
              variables: {
                input: {
                  betaId: beta.id,
                  bodyPart: bodyPart,
                  order: nextOrder,
                  holdId,
                },
                connections: [beta.moves.__id],
              },
            })
          }
        />
      ))}
    </>
  );
};

export default BetaOverlay;
