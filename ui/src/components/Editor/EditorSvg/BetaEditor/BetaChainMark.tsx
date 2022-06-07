import React, { useContext, useRef } from "react";
import { useDrag, useDrop } from "util/dnd";
import { styleDropHover } from "styles/svg";
import { ClickAwayListener } from "@mui/material";
import { EditorContext } from "util/context";
import Positioned from "../Positioned";
import BetaMoveIcon from "./BetaMoveIcon";
import { graphql, useFragment } from "react-relay";
import { BetaChainMark_betaMoveNode$key } from "./__generated__/BetaChainMark_betaMoveNode.graphql";
import useMutation from "util/useMutation";
import MutationError from "components/common/MutationError";
import { BetaChainMark_appendBetaMoveMutation } from "./__generated__/BetaChainMark_appendBetaMoveMutation.graphql";
import { BetaChainMark_deleteBetaMoveMutation } from "./__generated__/BetaChainMark_deleteBetaMoveMutation.graphql";
import { BetaChainMark_updateBetaMoveMutation } from "./__generated__/BetaChainMark_updateBetaMoveMutation.graphql";
import { useBetaMoveColors, useBetaMoveVisualPosition } from "util/svg";

interface Props {
  betaMoveKey: BetaChainMark_betaMoveNode$key;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainMark: React.FC<Props> = ({ betaMoveKey }) => {
  const betaMove = useFragment(
    graphql`
      fragment BetaChainMark_betaMoveNode on BetaMoveNode {
        id
        bodyPart
        order
        isLastInChain
        beta {
          id
        }
        # TODO can we remove these?
        hold {
          id
        }
      }
    `,
    betaMoveKey
  );
  const moveId = betaMove.id; // This gets captured by a lot of lambdas
  const colors = useBetaMoveColors()(moveId);
  const position = useBetaMoveVisualPosition()(moveId);

  const { commit: appendBetaMove, state: appendState } =
    useMutation<BetaChainMark_appendBetaMoveMutation>(graphql`
      mutation BetaChainMark_appendBetaMoveMutation(
        $input: AppendBetaMoveMutationInput!
      ) {
        appendBetaMove(input: $input) {
          betaMove {
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);
  const { commit: updateBetaMove, state: updateState } =
    useMutation<BetaChainMark_updateBetaMoveMutation>(graphql`
      mutation BetaChainMark_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            id
            # These are the only fields we modify
            hold {
              id
            }
          }
        }
      }
    `);
  const { commit: deleteBetaMove, state: deleteState } =
    useMutation<BetaChainMark_deleteBetaMoveMutation>(graphql`
      mutation BetaChainMark_deleteBetaMoveMutation(
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
    `);

  const ref = useRef<SVGCircleElement>(null);

  const [{ isDragging }, drag] = useDrag<
    "betaMoveOverlay",
    { isDragging: boolean }
  >({
    type: "betaMoveOverlay",
    item: {
      kind: "move",
      betaMoveId: moveId,
      bodyPart: betaMove.bodyPart,
    },
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
    end(item, monitor) {
      const result = monitor.getDropResult();
      if (result) {
        // Dragging the last move in a chain adds a new move
        if (betaMove.isLastInChain) {
          appendBetaMove({
            variables: {
              input: {
                betaId: betaMove.beta.id,
                bodyPart: item.bodyPart,
                holdId: result.holdId,
              },
            },
            // Punting on optimistic update because ordering is hard
          });
        } else {
          // Dragging an intermediate move just moves it to another spot
          updateBetaMove({
            variables: {
              input: { betaMoveId: moveId, holdId: result.holdId },
            },
            optimisticResponse: {
              updateBetaMove: {
                betaMove: { id: moveId, hold: { id: result.holdId } },
              },
            },
          });
        }
      }
    },
  });

  // Move is a drop target, just aliases to the underlying hold
  // TODO fix or remove
  const [{ isOver }, drop] = useDrop<"betaMoveOverlay", { isOver: boolean }>({
    accept: "betaMoveOverlay",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Tell the dragger which hold they just dropped onto
    // drop: () => ({ kind: "hold", holdId: betaMove.hold.id }),
  });

  const { highlightedMove, setHighlightedMove } = useContext(EditorContext);
  const isHighlighted = highlightedMove === moveId;

  drag(drop(ref));
  return (
    <>
      <ClickAwayListener
        // Listen for leading edge of event, to catch drags as well
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        // Click away => unhighlight move
        onClickAway={() => setHighlightedMove(undefined)}
      >
        <Positioned position={position}>
          <BetaMoveIcon
            ref={ref}
            bodyPart={betaMove.bodyPart}
            order={betaMove.order}
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
            isDragging={isDragging}
            isHighlighted={isHighlighted}
            css={isOver && styleDropHover}
            // Click => toggle highlight on move
            onClick={() =>
              // If we already "own" the highlight, then toggle off
              setHighlightedMove((old) => (old === moveId ? undefined : moveId))
            }
            // Double click => delete move
            onDoubleClick={() => {
              deleteBetaMove({
                variables: { input: { betaMoveId: moveId } },
                // Reset selection to prevent ghost highlight
                onCompleted: () => setHighlightedMove(undefined),
                // Punting on optimistic update because ordering is hard.
              });
            }}
            // Hover => highlight move
            onMouseEnter={() => setHighlightedMove(moveId)}
            onMouseLeave={() => setHighlightedMove(undefined)}
          />
        </Positioned>
      </ClickAwayListener>
      <MutationError message="Error adding move" state={appendState} />
      <MutationError message="Error updating move" state={updateState} />
      <MutationError message="Error deleting move" state={deleteState} />
    </>
  );
};

export default BetaChainMark;
