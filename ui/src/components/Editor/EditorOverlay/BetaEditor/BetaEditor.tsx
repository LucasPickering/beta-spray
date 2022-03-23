import React, { useCallback, useContext, useMemo } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import {
  BetaEditor_betaNode$data,
  BetaEditor_betaNode$key,
} from "./__generated__/BetaEditor_betaNode.graphql";
import {
  APIPosition,
  BetaOverlayMove,
  distanceTo,
  OverlayPosition,
  polarToCartesian,
  toBodyPart,
} from "../types";
import { BetaEditor_createBetaMoveMutation } from "./__generated__/BetaEditor_createBetaMoveMutation.graphql";
import BetaChain from "./BetaChain";
import { BetaEditor_updateBetaMoveMutation } from "./__generated__/BetaEditor_updateBetaMoveMutation.graphql";
import { BetaEditor_deleteBetaMoveMutation } from "./__generated__/BetaEditor_deleteBetaMoveMutation.graphql";
import { useOverlayUtils } from "util/useOverlayUtils";
import BetaMoveDialog from "./BetaMoveDialog";
import EditorContext from "context/EditorContext";
import { assertIsDefined, groupBy, isDefined } from "util/func";
import BodyState from "./BodyState";
import { DropHandler } from "util/dnd";
import { disambiguationDistance, maxDisambigutationDistance } from "../consts";

interface Props {
  betaKey: BetaEditor_betaNode$key;
}

/**
 * SVG overlay component for viewing and editing beta
 */
const BetaEditor: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(betaNodeFragment, betaKey);

  const { selectedHold, setSelectedHold, highlightedMove, setHighlightedMove } =
    useContext(EditorContext);

  const { toOverlayPosition } = useOverlayUtils();

  // Map moves to a shorthand form that we can use in the AI. These should
  // always be sorted by order from the API, and remain that way
  const moves: BetaOverlayMove[] = useMemo(
    () => getMoves(beta.moves.edges, highlightedMove, toOverlayPosition),
    [beta.moves.edges, highlightedMove, toOverlayPosition]
  );

  // Group the moves by body part so we can draw chains. We assume the API
  // response is ordered by `order`, so these should naturally be as well.
  const movesByBodyPart = useMemo(
    () => groupBy(moves, (move) => move.bodyPart),
    [moves]
  );

  // TODO use loading state
  const [createBetaMove] = useMutation<BetaEditor_createBetaMoveMutation>(
    createBetaMoveMutation
  );
  const [updateBetaMove] = useMutation<BetaEditor_updateBetaMoveMutation>(
    updateBetaMoveMutation
  );
  const [deleteBetaMove] = useMutation<BetaEditor_deleteBetaMoveMutation>(
    deleteBetaMoveMutation
  );

  const onDrop: DropHandler<"betaMoveOverlay"> = useCallback(
    (item, result) => {
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
                  bodyPart: item.move.bodyPart,
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
                bodyPart: item.startMove.bodyPart,
                order: item.startMove.order + 1,
                holdId: result.holdId,
              },
            },
          });
      }
    },
    [beta.id, createBetaMove, updateBetaMove]
  );

  const onDoubleClick = useCallback(
    (move: BetaOverlayMove) =>
      deleteBetaMove({
        variables: {
          input: {
            betaMoveId: move.id,
          },
        },
      }),
    [deleteBetaMove]
  );

  const onMouseEnter = useCallback(
    (move: BetaOverlayMove) => setHighlightedMove(move.id),
    [setHighlightedMove]
  );
  const onMouseLeave = useCallback(
    (move: BetaOverlayMove) =>
      // Only clear the highlight if we "own" it
      setHighlightedMove((old) => (move.id === old ? undefined : old)),
    [setHighlightedMove]
  );

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
          onDrop={onDrop}
          onDoubleClick={onDoubleClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        />
      ))}

      {/* After clicking an empty hold, show a modal to add a move to it */}
      <BetaMoveDialog
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

// This component is a chonker, so I moved the GQL stuff outside to shorten it
const betaNodeFragment = graphql`
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
`;
const createBetaMoveMutation = graphql`
  mutation BetaEditor_createBetaMoveMutation(
    $input: CreateBetaMoveMutationInput!
  ) {
    createBetaMove(input: $input) {
      betaMove {
        beta {
          ...BetaEditor_betaNode # Refetch to update UI
        }
      }
    }
  }
`;
const updateBetaMoveMutation = graphql`
  mutation BetaEditor_updateBetaMoveMutation(
    $input: UpdateBetaMoveMutationInput!
  ) {
    updateBetaMove(input: $input) {
      betaMove {
        beta {
          ...BetaEditor_betaNode # Refetch to update UI
        }
      }
    }
  }
`;
const deleteBetaMoveMutation = graphql`
  mutation BetaEditor_deleteBetaMoveMutation(
    $input: DeleteBetaMoveMutationInput!
  ) {
    deleteBetaMove(input: $input) {
      betaMove {
        beta {
          ...BetaEditor_betaNode # Refetch to update UI
        }
      }
    }
  }
`;

/**
 * Map API BetaMoveNodes to UI-friendly objects. This is kind of a Relay
 * anti-pattern, but it makes a lot of UI logic a whole lot simpler so who cares.
 *
 * @param edges Moves from the API
 * @param highlightedMove ID of the current move being hovered/highlighted
 * @param toOverlayPosition Function to convert API position to UI positionl
 *  this requires the context of the image aspect ratio
 * @returns UI move objects
 */
function getMoves(
  edges: BetaEditor_betaNode$data["moves"]["edges"],
  highlightedMove: string | undefined,
  toOverlayPosition: (apiPosition: APIPosition) => OverlayPosition
): BetaOverlayMove[] {
  const moves: BetaOverlayMove[] = edges.map(({ node }) => {
    // TODO render holdless moves
    assertIsDefined(node.hold);

    return {
      id: node.id,
      bodyPart: toBodyPart(node.bodyPart),
      order: node.order,
      position: toOverlayPosition(node.hold),
      offset: undefined,
    };
  });

  // This can be undefined even if highlightedMove is defined, if we've *just*
  // deleted the move
  const highlightedMoveObject = moves.find(
    (move) => move.id === highlightedMove
  );

  // Calculate offset for each move, based on disambiguation needs. If a move
  // is highlighted and there are any other moves near it, we'll apply a visual
  // offset to each of those moves to spread them apart, so the user can easily
  // access them all.
  if (isDefined(highlightedMoveObject)) {
    // Find all moves near the highlighted one
    const nearbyMoves = moves.filter(
      (move) =>
        distanceTo(highlightedMoveObject.position, move.position) <
        maxDisambigutationDistance
    );

    // If at least one move is near the highlighted one, we need to disambiguate
    // The highlighted move is guaranteed to be in this list, so if that's the
    // only one, we do nothing
    if (nearbyMoves.length > 1) {
      // We want to shift all the nearby moves apart. So break up the unit
      // circle into evenly sized slices, one per move, and shift each one away
      // a fixed distance along its slice angle.
      const sliceRadians = (2 * Math.PI) / nearbyMoves.length;

      nearbyMoves.forEach((move, i) => {
        move.offset = polarToCartesian(
          disambiguationDistance,
          sliceRadians * i
        );
      });
    }
  }

  return moves;
}

export default BetaEditor;
