import { isDefined } from "util/func";
import { useRef, useState } from "react";
import {
  DragFinishHandler,
  useDrag,
  useDragLayer,
} from "components/Editor/util/dnd";
import { ClickAwayListener, useTheme } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import {
  useBetaMoveColor,
  useBetaMoveVisualPosition,
} from "components/Editor/util/moves";
import {
  OpenWith as IconOpenWith,
  Delete as IconDelete,
  Notes as IconNotes,
} from "@mui/icons-material";
import ActionOrbs from "../common/ActionOrbs";
import Positioned from "../common/Positioned";
import ActionOrb from "../common/ActionOrb";
import SvgTooltip from "../common/SvgTooltip";
import { BetaMoveMark_betaMoveNode$key } from "./__generated__/BetaMoveMark_betaMoveNode.graphql";
import BetaMoveIcon from "./BetaMoveIcon";

interface Props {
  betaMoveKey: BetaMoveMark_betaMoveNode$key;
  isInCurrentStance: boolean;
  editable?: boolean;
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
  editable = false,
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
  const color = useBetaMoveColor()(moveId);
  const position = useBetaMoveVisualPosition()(moveId);

  const ref = useRef<SVGCircleElement>(null);
  const [isRelocating, setIsRelocating] = useState<boolean>(false);
  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const draggable = editable && (isRelocating || isInCurrentStance);

  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: isRelocating
      ? { action: "relocate", betaMoveId: moveId, bodyPart: betaMove.bodyPart }
      : { action: "create", bodyPart: betaMove.bodyPart },
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

  const { palette } = useTheme();

  drag(ref);
  return (
    <>
      <ClickAwayListener
        onClickAway={() => {
          // Reset local state when the user gets bored
          setIsRelocating(false);
          setIsHighlighted(false);
        }}
      >
        <Positioned position={position}>
          <BetaMoveIcon
            ref={ref}
            bodyPart={betaMove.bodyPart}
            order={betaMove.order}
            isStart={betaMove.isStart}
            isFree={!isDefined(betaMove.hold)}
            // Override color while relocating
            color={isRelocating ? palette.editor.actions.relocate.main : color}
            icon={isRelocating ? <IconOpenWith /> : undefined}
            size={isInCurrentStance || isHighlighted ? "large" : "small"}
            clickable // Move can be highlighted, even when not editing
            draggable={draggable}
            isDragging={isDragging}
            isHighlighted={isHighlighted}
            // Don't block drop events when another element is being dragged
            css={isDraggingOther && { pointerEvents: "none" }}
            // Click => toggle highlight
            onClick={() => {
              setIsHighlighted((prev) => !prev);
              setIsRelocating(false); // This just kinda feels natural
            }}
          />

          {/* Hide orbs while relocating so dragging is easier */}
          <ActionOrbs open={isHighlighted && editable && !isRelocating}>
            <ActionOrb
              color={palette.editor.actions.delete.main}
              onClick={onDelete && (() => onDelete(betaMove.id))}
            >
              <IconDelete />
            </ActionOrb>
            <ActionOrb
              color={palette.editor.actions.edit.main}
              onClick={
                onEditAnnotation && (() => onEditAnnotation(betaMove.id))
              }
            >
              <IconNotes />
            </ActionOrb>
            <ActionOrb
              color={palette.editor.actions.relocate.main}
              onClick={() => setIsRelocating(true)}
            >
              <IconOpenWith />
            </ActionOrb>
          </ActionOrbs>
        </Positioned>
      </ClickAwayListener>

      {betaMove.annotation && (
        <SvgTooltip
          open={isInCurrentStance || isHighlighted}
          anchorEl={ref.current}
          title={betaMove.annotation}
          placement="top-right"
        />
      )}
    </>
  );
};

export default BetaMoveMark;
