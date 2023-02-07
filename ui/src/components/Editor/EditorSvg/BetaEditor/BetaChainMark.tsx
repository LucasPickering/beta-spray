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
import RadialActions from "../common/RadialActions";
import { BodyPart } from "components/Editor/util/svg";
import SvgButton from "../common/SvgButton";

interface Props {
  betaMoveKey: BetaChainMark_betaMoveNode$key;
  isInCurrentStance: boolean;

  /**
   * Called when the Edit button is clicked for this move
   */
  onEdit?: () => void;

  /**
   * Called when the Delete button is clicked for this move
   */
  onDelete?: () => void;

  /**
   * Called when this move is finished being dragged
   */
  onDragFinish?: DragFinishHandler<"overlayBetaMove">;
}

/**
 * Props to be passed to RadialActions, based on body part.
 */
const actionsProps: Record<BodyPart, { startAngle: number; reverse: boolean }> =
  {
    LEFT_HAND: { startAngle: 90, reverse: false },
    RIGHT_HAND: { startAngle: 90, reverse: true },
    LEFT_FOOT: { startAngle: 270, reverse: true },
    RIGHT_FOOT: { startAngle: 270, reverse: false },
  };

/**
 * An icon representing a single beta move in a chain
 */
const BetaChainMark: React.FC<Props> = ({
  betaMoveKey,
  isInCurrentStance,
  onEdit,
  onDelete,
  onDragFinish,
}) => {
  const betaMove = useFragment(
    graphql`
      fragment BetaChainMark_betaMoveNode on BetaMoveNode {
        ...AddBetaMoveMark_betaMoveNode
        id
        bodyPart
        order
        hold {
          id
        }
        isStart
        isLastInChain
        annotation
      }
    `,
    betaMoveKey
  );
  const moveId = betaMove.id; // This gets captured by a lot of lambdas
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
          draggable
          isDragging={isDragging}
          isHighlighted={isHighlighted}
          // Don't block drop events when another element is being dragged
          css={isDraggingOther && { pointerEvents: "none" }}
          // Hover (desktop) or click (mobile) => highlight the move
          onClick={highlightThis}
          onMouseEnter={highlightThis}
        />

        <RadialActions
          actions={[
            {
              key: "edit",
              element: <SvgButton onClick={onEdit} />,
              visible: isHighlighted,
            },
            {
              key: "add",
              element: (
                <AddBetaMoveMark
                  betaMoveKey={betaMove}
                  onDragFinish={onDragFinish}
                />
              ),
              visible: isHighlighted || isInCurrentStance,
            },
            {
              key: "delete",
              element: <SvgButton color="error" onClick={onDelete} />,
              visible: isHighlighted,
            },
          ]}
          {...actionsProps[betaMove.bodyPart]}
        />
      </Positioned>

      {betaMove.annotation && (
        <Portal>
          <Tooltip
            open={isInCurrentStance}
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
