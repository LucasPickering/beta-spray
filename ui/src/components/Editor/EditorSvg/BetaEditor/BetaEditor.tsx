import React, { useCallback, useContext, useMemo } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import {
  BetaEditor_betaNode$data,
  BetaEditor_betaNode$key,
} from "./__generated__/BetaEditor_betaNode.graphql";
import {
  APIPosition,
  BetaOverlayMove,
  BodyPart,
  getMoveColor,
  OverlayPosition,
  polarToSvg,
  toBodyPart,
} from "util/svg";
import { BetaEditor_createBetaMoveMutation } from "./__generated__/BetaEditor_createBetaMoveMutation.graphql";
import { BetaEditor_updateBetaMoveMutation } from "./__generated__/BetaEditor_updateBetaMoveMutation.graphql";
import { BetaEditor_deleteBetaMoveMutation } from "./__generated__/BetaEditor_deleteBetaMoveMutation.graphql";
import { useOverlayUtils } from "util/svg";
import BetaMoveDialog from "./BetaMoveDialog";
import { EditorContext } from "util/context";
import { assertIsDefined, groupBy, isDefined } from "util/func";
import BodyState from "./BodyState";
import { DropHandler } from "util/dnd";
import BetaChainLine from "./BetaChainLine";
import BetaChainMark from "./BetaChainMark";
import useMutation from "util/useMutation";
import MutationError from "components/common/MutationError";
import withQuery from "util/withQuery";
import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "components/Editor/queries";

/** The distance to shift a disambiguated move */
const disambiguationDistance = 2.5;

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
    () => buildMoves(beta.moves.edges, toOverlayPosition),
    [beta.moves.edges, toOverlayPosition]
  );

  // Group the moves by body part so we can draw chains. We assume the API
  // response is ordered by `order`, so these should naturally be as well.
  const movesByBodyPart = useMemo(
    () => groupBy(moves, (move) => move.bodyPart),
    [moves]
  );

  const { commit: createBetaMove, state: createState } =
    useMutation<BetaEditor_createBetaMoveMutation>(createBetaMoveMutation);
  const { commit: updateBetaMove, state: updateState } =
    useMutation<BetaEditor_updateBetaMoveMutation>(updateBetaMoveMutation);
  const { commit: deleteBetaMove, state: deleteState } =
    useMutation<BetaEditor_deleteBetaMoveMutation>(deleteBetaMoveMutation);

  const onDrop: DropHandler<"betaMoveOverlay"> = useCallback(
    (item, result) => {
      // Called when a move is dragged onto some target
      // For now, the only thing we can drag onto is a hold

      switch (item.kind) {
        case "move":
          // If the landing spot is the same as the move being dragged, do nothing
          if (item.move.holdId !== result.holdId) {
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
                // Punting on optimistic update because ordering is hard
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
                optimisticResponse: {
                  updateBetaMove: {
                    betaMove: { id: item.move.id, hold: { id: result.holdId } },
                  },
                },
              });
            }
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
            // Punting on optimistic update because ordering is hard
          });
      }
    },
    [beta.id, createBetaMove, updateBetaMove]
  );

  const onClick = useCallback(
    (move: BetaOverlayMove) =>
      setHighlightedMove((old) => (old === move.id ? undefined : move.id)),
    [setHighlightedMove]
  );
  const onDoubleClick = useCallback(
    (move: BetaOverlayMove) =>
      deleteBetaMove({
        variables: {
          input: {
            betaMoveId: move.id,
          },
        },
        // Punting on optimistic update because ordering is hard
        // Prevent ghost highlight
        onCompleted: () => setHighlightedMove(undefined),
      }),
    [deleteBetaMove, setHighlightedMove]
  );
  const onClickAway = useCallback(
    // If this move "owns" the highlight, wipe it out when we click away
    (move: BetaOverlayMove) =>
      setHighlightedMove((old) => (old === move.id ? undefined : old)),
    [setHighlightedMove]
  );

  // Render one "chain" of moves per body part
  return (
    <>
      {/* Draw lines to connect the moves. Do this *first* so they go on bottom */}
      {Array.from(movesByBodyPart.values(), (moveChain) =>
        moveChain.map((move, i) => {
          const prev = moveChain[i - 1];
          return prev ? (
            <BetaChainLine
              key={move.id}
              startMove={prev}
              endMove={move}
              onDrop={onDrop}
            />
          ) : null;
        })
      )}

      {/* If user is hovering a move, show what the body looks like at that
          point. We want this above the move lines, but below the move marks */}
      {highlightedMove && (
        <BodyState moves={moves} highlightedMove={highlightedMove} />
      )}

      {/* Draw the actual move marks */}
      {Array.from(movesByBodyPart.values(), (moveChain) =>
        moveChain.map((move, i) => (
          <BetaChainMark
            key={move.id}
            move={move}
            isLast={i === moveChain.length - 1}
            onDrop={onDrop}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onClickAway={onClickAway}
          />
        ))
      )}

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
            // Punting on optimistic update because ordering is hard
          });
          setSelectedHold(undefined);
        }}
      />

      <MutationError message="Error creating move" state={createState} />
      <MutationError message="Error updating move" state={updateState} />
      <MutationError message="Error deleting move" state={deleteState} />
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
            id
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
        id
        # These are the fields we modify
        hold {
          id
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
 * Body parts sorted counter-clockwise, which follows the unit circle
 */
const bodyPartsCCW = [
  BodyPart.RIGHT_HAND,
  BodyPart.LEFT_HAND,
  BodyPart.LEFT_FOOT,
  BodyPart.RIGHT_FOOT,
];

/**
 * Map API BetaMoveNodes to UI-friendly objects. This is kind of a Relay
 * anti-pattern, but it makes a lot of UI logic a whole lot simpler so who cares.
 *
 * @param edges Moves from the API
 * @param toOverlayPosition Function to convert API position to UI positionl
 *  this requires the context of the image aspect ratio
 * @returns UI move objects
 */
function buildMoves(
  edges: BetaEditor_betaNode$data["moves"]["edges"],
  toOverlayPosition: (apiPosition: APIPosition) => OverlayPosition
): BetaOverlayMove[] {
  let seenBodyParts: Set<BodyPart> | undefined = new Set();
  const moves: BetaOverlayMove[] = edges.map(({ node }) => {
    // TODO render holdless moves
    assertIsDefined(node.hold);

    // This is a little jank, but we want to identify start moves and any move
    // that occurs before the first body part moves again. Importantly, we don't
    // just take the first move for each body part, because we won't necessarily
    // have every part on for the start.
    const bodyPart = toBodyPart(node.bodyPart);
    let isStart = false;
    if (isDefined(seenBodyParts)) {
      if (seenBodyParts.has(bodyPart)) {
        // undefined indicates we're past the start and can skip this logic
        seenBodyParts = undefined;
      } else {
        isStart = true;
        seenBodyParts.add(bodyPart);
      }
    }

    return {
      id: node.id,
      bodyPart,
      order: node.order,
      holdId: node.hold.id,
      position: toOverlayPosition(node.hold),
      isStart,
      color: getMoveColor(node.order, edges.length),
      // This will be updated below
      offset: { x: 0, y: 0 },
    };
  });

  // Next step is to apply a visual offset to each move to make them legible.
  // We want to position each move like so:
  // 1. By body part, so left hand is top-left, right foot is bottom-right, etc.
  // 2. Spread evenly within that 90° slice (if multiple moves per body part)
  // So iterate over each move and set its visual offset accordingly

  const sliceSize = Math.PI / 2; // 90 degrees

  // Group by hold, then body part
  for (const holdMoves of groupBy(moves, (move) => move.holdId).values()) {
    const movesByBodyPart = groupBy(holdMoves, (move) => move.bodyPart);

    bodyPartsCCW.forEach((bodyPart, i) => {
      const bodyPartMoves = movesByBodyPart.get(bodyPart);
      if (isDefined(bodyPartMoves)) {
        // The angle of the *start* of the slice
        const bodyPartAngle = sliceSize * i;

        // Break the slice into n+1 subslices, where n is number of moves on this
        // hold *for this body part*. We do +1 because we want them evenly spaced
        // between beginning and end, e.g. 1 move => 1/2 mark, 2 moves => 1/3 marks
        const subsliceSize = sliceSize / (bodyPartMoves.length + 1);

        // API wil pre-sort by order, and that ordering will persist here
        bodyPartMoves.forEach((move, i) => {
          move.offset = polarToSvg(
            disambiguationDistance,
            // i+1 so we don't start at the extreme edge
            bodyPartAngle + subsliceSize * (i + 1)
          );
        });
      }
    });
  }

  return moves;
}

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  // This is rendered on top of the existing editor, so we don't want to block
  // anything while beta is loading
  fallbackElement: null,
})(BetaEditor);
