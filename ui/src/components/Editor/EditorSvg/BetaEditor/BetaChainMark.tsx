import { useRef } from "react";
import {
  DragFinishHandler,
  useDrag,
  useDragLayer,
} from "components/Editor/util/dnd";
import { Portal, Tooltip } from "@mui/material";
import Positioned from "../common/Positioned";
import BetaMoveIcon from "./BetaMoveIcon";
import { graphql, useFragment } from "react-relay";
import { BetaChainMark_betaMoveNode$key } from "./__generated__/BetaChainMark_betaMoveNode.graphql";
import {
  useBetaMoveColor,
  useBetaMoveVisualPosition,
} from "components/Editor/util/moves";
import { isDefined } from "util/func";
import { useHighlight } from "components/Editor/util/highlight";
import AddBetaMoveMark from "./AddBetaMoveMark";

interface Props {
  betaMoveKey: BetaChainMark_betaMoveNode$key;
  isInCurrentStance: boolean;
  onDragFinish?: DragFinishHandler<"overlayBetaMove">;
}

/**
 * An icon representing a single beta move in a chain
 */
const BetaChainMark: React.FC<Props> = ({
  betaMoveKey,
  isInCurrentStance,
  onDragFinish,
}) => {
  const betaMove = useFragment(
    graphql`
      fragment BetaChainMark_betaMoveNode on BetaMoveNode {
        id
        bodyPart
        order
        hold {
          id
        }
        isStart
        annotation
      }
    `,
    betaMoveKey
  );
  const moveId = betaMove.id; // This gets captured by a lot of lambdas
  const editable = isDefined(onDragFinish);
  const color = useBetaMoveColor()(moveId);
  const position = useBetaMoveVisualPosition()(moveId);

  const ref = useRef<SVGCircleElement>(null);

  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: {
      action: "relocate",
      betaMoveId: moveId,
      bodyPart: betaMove.bodyPart,
    },
    canDrag: editable,
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
    end(draggedItem, monitor) {
      const dropResult = monitor.getDropResult();
      if (onDragFinish && isDefined(dropResult)) {
        onDragFinish(draggedItem, dropResult, monitor);
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

  const [highlightedMoveId, highlightMove] = useHighlight("move");
  const isHighlighted = highlightedMoveId === moveId;
  const highlightThis = (): void => highlightMove(moveId);

  drag(ref);
  return (
    <>
      <Positioned position={position}>
        <BetaMoveIcon
          ref={ref}
          bodyPart={betaMove.bodyPart}
          order={betaMove.order}
          isStart={betaMove.isStart}
          isFree={!isDefined(betaMove.hold)}
          color={color}
          variant={isInCurrentStance || isHighlighted ? "large" : "small"}
          draggable={editable}
          isDragging={isDragging}
          isHighlighted={isHighlighted}
          // Don't block drop events when another element is being dragged
          css={isDraggingOther && { pointerEvents: "none" }}
          // Click => highlight the move
          onClick={highlightThis}
        />

        {editable && isInCurrentStance && (
          <AddBetaMoveMark
            bodyPart={betaMove.bodyPart}
            variant="move"
            onDragFinish={onDragFinish}
          />
        )}
      </Positioned>

      {betaMove.annotation && (
        <Portal>
          <Tooltip
            // On first render, ref.current will still be null. If we try to
            // show the popover then, it'll spit out an error about anchorEl
            // being null. So we need to stall it until the second render.
            open={isDefined(ref.current) && isInCurrentStance}
            title={betaMove.annotation}
            placement="bottom"
            PopperProps={{ anchorEl: ref.current }}
          >
            <span />
          </Tooltip>
        </Portal>
      )}
    </>
  );
};

export default BetaChainMark;
