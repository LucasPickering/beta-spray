import { useRef, useState } from "react";
import {
  DragFinishHandler,
  useDrag,
  useDragLayer,
} from "components/Editor/util/dnd";
import { ClickAwayListener, Portal, Tooltip, useTheme } from "@mui/material";
import Positioned from "../common/Positioned";
import BetaMoveIcon from "./BetaMoveIcon";
import { graphql, useFragment } from "react-relay";
import { BetaMoveMark_betaMoveNode$key } from "./__generated__/BetaMoveMark_betaMoveNode.graphql";
import { useBetaMoveVisualPosition } from "components/Editor/util/moves";
import { isDefined } from "util/func";
import { useEditorMode } from "components/Editor/util/mode";
import ActionOrbs from "../ActionOrbs";

interface Props {
  betaMoveKey: BetaMoveMark_betaMoveNode$key;
  isInCurrentStance: boolean;
  onEditAnnotation?: (betaMoveId: string) => void;
  onDelete?: (betaMoveId: string) => void;
  onDragFinish?: DragFinishHandler<"overlayBetaMove">;
}

/**
 * An icon representing a single beta move in a chain
 */
const BetaMoveMark: React.FC<Props> = ({
  betaMoveKey,
  isInCurrentStance,
  onEditAnnotation,
  onDelete,
  onDragFinish,
}) => {
  const betaMove = useFragment(
    graphql`
      fragment BetaMoveMark_betaMoveNode on BetaMoveNode {
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
  const { palette } = useTheme();
  // const color = useBetaMoveColor()(moveId);
  const position = useBetaMoveVisualPosition()(moveId);
  const { action } = useEditorMode();
  const color = palette[`editorAction--${action}`].main;

  const ref = useRef<SVGCircleElement>(null);

  const draggable = isDefined(onDragFinish);
  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: { betaMoveId: moveId, bodyPart: betaMove.bodyPart },
    canDrag: draggable,
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

  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);

  drag(ref);
  return (
    <>
      <ClickAwayListener onClickAway={() => setIsHighlighted(false)}>
        <Positioned position={position}>
          <BetaMoveIcon
            ref={ref}
            bodyPart={betaMove.bodyPart}
            order={betaMove.order}
            isStart={betaMove.isStart}
            isFree={!isDefined(betaMove.hold)}
            color={color}
            variant={isInCurrentStance || isHighlighted ? "large" : "small"}
            draggable={draggable}
            isDragging={isDragging}
            isHighlighted={isHighlighted}
            // Don't block drop events when another element is being dragged
            css={isDraggingOther && { pointerEvents: "none" }}
            // Click => toggle highlight
            onClick={() => setIsHighlighted((prev) => !prev)}
          />

          <ActionOrbs
            open={isHighlighted}
            actions={[
              {
                id: "edit",
                color: "yellow",
                onClick:
                  onEditAnnotation && (() => onEditAnnotation(betaMove.id)),
              },
              {
                id: "delete",
                color: "red",
                onClick: onDelete && (() => onDelete(betaMove.id)),
              },
            ]}
          />
        </Positioned>
      </ClickAwayListener>

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

export default BetaMoveMark;
