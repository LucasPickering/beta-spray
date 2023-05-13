import { isDefined } from "util/func";
import { useRef, useState } from "react";
import {
  DragFinishHandler,
  DropHandler,
  useDrag,
  useDrop,
} from "components/Editor/util/dnd";
import { graphql, useFragment } from "react-relay";
import { ClickAwayListener, useTheme } from "@mui/material";
import { Delete as IconDelete, Notes as IconNotes } from "@mui/icons-material";
import ActionOrbs from "../common/ActionOrbs";
import Positioned from "../common/Positioned";
import ActionOrb from "../common/ActionOrb";
import SvgTooltip from "../common/SvgTooltip";
import HoldIcon from "./HoldIcon";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";

interface Props {
  holdKey: HoldMark_holdNode$key;
  editable?: boolean;
  onEditAnnotation?: (holdId: string) => void;
  onDelete?: (holdId: string) => void;
  /**
   * Called when this hold is dropped onto something else
   */
  onDragFinish?: DragFinishHandler<"overlayHold">;
  /**
   * Called when something is dropped *onto* this hold
   */
  onDrop?: DropHandler<"overlayBetaMove", "hold">;
}

/**
 * An editable hold, in the context of the full interface editor.
 */
const HoldMark: React.FC<Props> = ({
  holdKey,
  editable = false,
  onEditAnnotation,
  onDelete,
  onDragFinish,
  onDrop,
}) => {
  const ref = useRef<SVGCircleElement | null>(null);
  const hold = useFragment(
    graphql`
      fragment HoldMark_holdNode on HoldNode {
        id
        position {
          x
          y
        }
        annotation
      }
    `,
    holdKey
  );

  const [{ isDragging }, drag] = useDrag<
    "overlayHold",
    { isDragging: boolean }
  >({
    type: "overlayHold",
    item: { action: "relocate", holdId: hold.id },
    canDrag: editable,
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end(draggedItem, monitor) {
      const dropResult = monitor.getDropResult();
      if (isDefined(dropResult)) {
        onDragFinish?.(draggedItem, dropResult, monitor);
      }
    },
  });

  // Drop *moves* onto this hold
  const [{ isOver }, drop] = useDrop<"overlayBetaMove", { isOver: boolean }>({
    accept: "overlayBetaMove",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Apply mutation based on exactly what was dropped
    drop(item, monitor) {
      const result = {
        kind: "hold",
        holdId: hold.id,
        position: hold.position,
      } as const;
      if (onDrop) {
        onDrop(item, result, monitor);
      }
      return result;
    },
  });

  const [isHighlighted, setIsHighlighted] = useState<boolean>(false);
  const { palette } = useTheme();

  drag(drop(ref));
  return (
    <>
      <ClickAwayListener onClickAway={() => setIsHighlighted(false)}>
        <Positioned ref={ref} position={hold.position}>
          <HoldIcon
            clickable // Move can be highlighted, even when not editing
            draggable={editable}
            isDragging={isDragging}
            isOver={isOver}
            isHighlighted={isHighlighted}
            // Click => toggle highlight
            onClick={() => setIsHighlighted((prev) => !prev)}
          />

          <ActionOrbs open={editable && isHighlighted}>
            <ActionOrb
              color={palette.editor.actions.delete.main}
              onClick={onDelete && (() => onDelete(hold.id))}
            >
              <IconDelete />
            </ActionOrb>
            <ActionOrb
              color={palette.editor.actions.edit.main}
              onClick={onEditAnnotation && (() => onEditAnnotation(hold.id))}
            >
              <IconNotes />
            </ActionOrb>
          </ActionOrbs>
        </Positioned>
      </ClickAwayListener>

      {hold.annotation && (
        <SvgTooltip
          open={isHighlighted}
          anchorEl={ref.current}
          title={hold.annotation}
        />
      )}
    </>
  );
};

HoldMark.defaultProps = {} as Partial<Props>;

export default HoldMark;
