import React, { useContext } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaOverlay_betaNode$key } from "./__generated__/BetaOverlay_betaNode.graphql";
import OverlayContext from "context/OverlayContext";
import { BetaOverlayMove, BodyPart } from "./types";
import { BetaOverlay_createBetaMoveMutation } from "./__generated__/BetaOverlay_createBetaMoveMutation.graphql";
import BetaChain from "./BetaChain";
import { toOverlayPosition } from "util/func";
import { BetaOverlay_updateBetaMoveMutation } from "./__generated__/BetaOverlay_updateBetaMoveMutation.graphql";
import { BetaOverlay_deleteBetaMoveMutation } from "./__generated__/BetaOverlay_deleteBetaMoveMutation.graphql";

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

  const moves = beta.moves.edges.reduce<BetaOverlayMove[]>((acc, { node }) => {
    // TODO render holdless moves
    if (!node.hold) {
      console.warn("skipping move (no associated hold)", node);
      return acc;
    }

    acc.push({
      id: node.id,
      bodyPart: node.bodyPart,
      order: node.order,
      position: toOverlayPosition(node.hold, aspectRatio),
    });
    return acc;
  }, []);

  // Group the moves by body part so we can draw chains. We assume the API
  // response is ordered by `order`, so these should naturally be as well.
  const movesByBodyPart = moves.reduce<Map<BodyPart, BetaOverlayMove[]>>(
    (acc, move) => {
      const movesForBodyPart = acc.get(move.bodyPart) ?? [];
      movesForBodyPart.push(move);
      acc.set(move.bodyPart, movesForBodyPart);
      return acc;
    },
    new Map()
  );

  // Within each chain, link prev<==>current<==>next, so each move knows about
  // its neighbors
  for (const moves of movesByBodyPart.values()) {
    moves.forEach((move, i) => {
      move.prev = moves[i - 1];
      move.next = moves[i + 1];
    });
  }

  // TODO use loading state
  // TODO centralize all mutations
  const [createBetaMove] =
    useMutation<BetaOverlay_createBetaMoveMutation>(graphql`
      mutation BetaOverlay_createBetaMoveMutation(
        $input: CreateBetaMoveMutationInput!
      ) {
        createBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaOverlay_betaNode
            }
          }
        }
      }
    `);

  // TODO use loading state
  // TODO centralize all mutations
  const [updateBetaMove] =
    useMutation<BetaOverlay_updateBetaMoveMutation>(graphql`
      mutation BetaOverlay_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaOverlay_betaNode
            }
          }
        }
      }
    `);

  // TODO use loading state
  // TODO centralize all mutations
  const [deleteBetaMove] =
    useMutation<BetaOverlay_deleteBetaMoveMutation>(graphql`
      mutation BetaOverlay_deleteBetaMoveMutation(
        $input: DeleteBetaMoveMutationInput!
      ) {
        deleteBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaOverlay_betaNode
            }
          }
        }
      }
    `);

  // Render one "chain" of moves per body part
  return (
    <>
      {Array.from(movesByBodyPart.entries(), ([bodyPart, movesForBodyPart]) => (
        <BetaChain
          key={bodyPart}
          moves={movesForBodyPart}
          onDrop={(item, result) => {
            // Called when a move is dragged onto some target
            if (result.kind === "hold") {
              // Dragging a move onto a hold - either add a new move (if this
              // is the last in the chain) or move this one to a different hold
              if (item.kind === "move") {
                // TODO figure out how to update the last move without creating
                // a new one
                if (item.move.next) {
                  updateBetaMove({
                    variables: {
                      input: {
                        betaMoveId: item.move.id,
                        holdId: result.holdId,
                      },
                    },
                  });
                } else {
                  createBetaMove({
                    variables: {
                      input: {
                        betaId: beta.id,
                        bodyPart,
                        holdId: result.holdId,
                      },
                    },
                  });
                }
              }

              // Dragged a line to a hold - insert a move in the middle
              if (item.kind === "line") {
                createBetaMove({
                  variables: {
                    input: {
                      betaId: beta.id,
                      bodyPart,
                      order: item.startMove.order + 1,
                      holdId: result.holdId,
                    },
                  },
                });
              }
            }
          }}
          onDoubleClick={(move) =>
            deleteBetaMove({
              variables: {
                input: {
                  betaMoveId: move.id,
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
