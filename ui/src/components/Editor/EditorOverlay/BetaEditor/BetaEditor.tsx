import React, { useContext } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { BetaEditor_betaNode$key } from "./__generated__/BetaEditor_betaNode.graphql";
import { BetaOverlayMove, BodyPart, toBodyPart } from "../types";
import { BetaEditor_createBetaMoveMutation } from "./__generated__/BetaEditor_createBetaMoveMutation.graphql";
import BetaChain from "./BetaChain";
import { BetaEditor_updateBetaMoveMutation } from "./__generated__/BetaEditor_updateBetaMoveMutation.graphql";
import { BetaEditor_deleteBetaMoveMutation } from "./__generated__/BetaEditor_deleteBetaMoveMutation.graphql";
import { useOverlayUtils } from "util/useOverlayUtils";
import BetaMoveModal from "./BetaMoveModal";
import EditorContext from "context/EditorContext";
import { assertIsDefined } from "util/func";
import BodyState from "./BodyState";

interface Props {
  betaKey: BetaEditor_betaNode$key;
}

/**
 * SVG overlay component for viewing and editing beta
 */
const BetaEditor: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaEditor_betaNode on BetaNode {
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
    betaKey
  );

  const { selectedHold, setSelectedHold, highlightedMove, setHighlightedMove } =
    useContext(EditorContext);

  const { toOverlayPosition } = useOverlayUtils();

  // Map moves to a shorthand form that we can use in the AI. These should
  // always be sorted by order from the API, and remain that way
  const moves: BetaOverlayMove[] = beta.moves.edges.map(({ node }) => {
    // TODO render holdless moves
    assertIsDefined(node.hold);

    return {
      id: node.id,
      bodyPart: toBodyPart(node.bodyPart),
      order: node.order,
      position: toOverlayPosition(node.hold),
    };
  });

  // Group the moves by body part so we can draw chains. We assume the API
  // response is ordered by `order`, so these should naturally be as well.
  const movesByBodyPart = Object.values(BodyPart).reduce<
    Map<BodyPart, BetaOverlayMove[]>
  >((acc, bodyPart) => {
    acc.set(bodyPart, []);
    return acc;
  }, new Map());
  for (const move of moves) {
    const movesForBodyPart = movesByBodyPart.get(move.bodyPart) ?? [];
    movesForBodyPart.push(move);
  }

  // TODO use loading state
  const [createBetaMove] =
    useMutation<BetaEditor_createBetaMoveMutation>(graphql`
      mutation BetaEditor_createBetaMoveMutation(
        $input: CreateBetaMoveMutationInput!
      ) {
        createBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaEditor_betaNode
            }
          }
        }
      }
    `);

  // TODO use loading state
  const [updateBetaMove] =
    useMutation<BetaEditor_updateBetaMoveMutation>(graphql`
      mutation BetaEditor_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            beta {
              # Refetch to update UI
              ...BetaEditor_betaNode
            }
          }
        }
      }
    `);

  // TODO use loading state
  const [deleteBetaMove] =
    useMutation<BetaEditor_deleteBetaMoveMutation>(graphql`
      mutation BetaEditor_deleteBetaMoveMutation(
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

  // Render one "chain" of moves per body part
  return (
    <>
      {/* If user is hovering a move, show what the body looks like at that point */}
      {highlightedMove && (
        <BodyState moves={moves} highlightedMove={highlightedMove} />
      )}

      {Array.from(movesByBodyPart.entries(), ([bodyPart, moveChain]) => (
        <BetaChain
          key={bodyPart}
          moves={moveChain}
          onDrop={(item, result) => {
            // Called when a move is dragged onto some target
            // For now, the only thing we can drag onto is a hold

            switch (item.kind) {
              case "move":
                // Dragging the last move in a chain adds a new move
                if (item.isLast) {
                  createBetaMove({
                    variables: {
                      input: {
                        betaId: beta.id,
                        bodyPart,
                        holdId: result.holdId,
                      },
                    },
                  });
                } else {
                  // Dragging an intermediate move just moves it to another spot
                  updateBetaMove({
                    variables: {
                      input: {
                        betaMoveId: item.move.id,
                        holdId: result.holdId,
                      },
                    },
                  });
                }
                break;

              // Insert a new move into the middle of the chain
              case "line":
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
          onMouseEnter={(move) => setHighlightedMove(move.id)}
          onMouseLeave={(move) =>
            // Only clear the highlight if we "own" it
            setHighlightedMove((old) => (move.id === old ? undefined : old))
          }
        />
      ))}

      {/* After clicking an empty hold, show a modal to add a move to it */}
      <BetaMoveModal
        isOpen={selectedHold !== undefined}
        onClose={() => setSelectedHold(undefined)}
        onSelectBodyPart={(bodyPart) => {
          createBetaMove({
            variables: {
              input: {
                betaId: beta.id,
                bodyPart,
                holdId: selectedHold,
              },
            },
          });
          setSelectedHold(undefined);
        }}
      />
    </>
  );
};

export default BetaEditor;
