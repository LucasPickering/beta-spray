import React, { useContext, useRef } from "react";
import { useDrag, useDragLayer } from "util/dnd";
import { ClickAwayListener, Portal, Tooltip } from "@mui/material";
import {
  EditorHighlightedMoveContext,
  EditorSelectedMoveContext,
} from "util/context";
import Positioned from "../Positioned";
import BetaMoveIcon from "./BetaMoveIcon";
import { graphql, useFragment } from "react-relay";
import { BetaChainMark_betaMoveNode$key } from "./__generated__/BetaChainMark_betaMoveNode.graphql";
import useMutation from "util/useMutation";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { BetaChainMark_appendBetaMoveMutation } from "./__generated__/BetaChainMark_appendBetaMoveMutation.graphql";
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
        annotation
        beta {
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

  // Check if we're dragging *anything*. We'll mask this with isDragging from
  // above to check if we're dragging anything *else*. If so, we'll disable
  // pointer events for this element. This will prevent us from blocking drop
  // events on the underlying hold.
  const { isDraggingAny } = useDragLayer((monitor) => ({
    isDraggingAny: monitor.isDragging(),
  }));
  const isDraggingOther = isDraggingAny && !isDragging;

  const [highlightedMove, setHighlightedMove] = useContext(
    EditorHighlightedMoveContext
  );
  const [, setSelectedMove] = useContext(EditorSelectedMoveContext);
  const isHighlighted = highlightedMove === moveId;

  drag(ref);
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
            hasAnnotation={Boolean(betaMove.annotation)}
            primaryColor={colors.primary}
            secondaryColor={colors.secondary}
            isDragging={isDragging}
            isHighlighted={isHighlighted}
            // Don't block drop events when another element is being dragged
            css={isDraggingOther && { pointerEvents: "none" }}
            // Click => toggle highlight on move
            onClick={() =>
              // If we already "own" the selection, then toggle off
              setHighlightedMove((old) => (old === moveId ? undefined : moveId))
            }
            // Double click => delete move
            onDoubleClick={() => setSelectedMove(moveId)}
            // Hover => highlight move
            onMouseEnter={() => setHighlightedMove(moveId)}
            onMouseLeave={() => setHighlightedMove(undefined)}
          />
        </Positioned>
      </ClickAwayListener>

      {betaMove.annotation && (
        <Portal>
          <Tooltip
            open={isHighlighted}
            title={betaMove.annotation}
            placement="top-end"
            PopperProps={{ anchorEl: ref.current }}
          >
            <span />
          </Tooltip>
        </Portal>
      )}

      <MutationErrorSnackbar message="Error adding move" state={appendState} />
      <MutationErrorSnackbar
        message="Error updating move"
        state={updateState}
      />
    </>
  );
};

export default BetaChainMark;
