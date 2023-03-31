import { useRef, useState } from "react";
import {
  DragFinishHandler,
  DropHandler,
  useDrag,
  useDrop,
} from "components/Editor/util/dnd";
import { graphql, useFragment } from "react-relay";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";
import Positioned from "../common/Positioned";
import HoldIcon from "./HoldIcon";
import { ClickAwayListener, Portal, Tooltip } from "@mui/material";
import { isDefined } from "util/func";
import ActionOrbs from "../ActionOrbs";

interface Props {
  holdKey: HoldMark_holdNode$key;
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

  const draggable = isDefined(onDragFinish);
  const [{ isDragging }, drag] = useDrag<
    "overlayHold",
    { isDragging: boolean }
  >({
    type: "overlayHold",
    item: { action: "relocate", holdId: hold.id },
    canDrag: draggable,
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end(draggedItem, monitor) {
      const dropResult = monitor.getDropResult();
      if (onDragFinish && isDefined(dropResult)) {
        onDragFinish(draggedItem, dropResult, monitor);
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

  drag(drop(ref));
  return (
    <>
      <ClickAwayListener onClickAway={() => setIsHighlighted(false)}>
        <Positioned ref={ref} position={hold.position}>
          <HoldIcon
            draggable={draggable}
            isDragging={isDragging}
            isOver={isOver}
            isHighlighted={isHighlighted}
            // Click => toggle highlight
            onClick={() => setIsHighlighted((prev) => !prev)}
          />

          <ActionOrbs
            open={isHighlighted}
            actions={[
              {
                id: "edit",
                color: "yellow",
                onClick: onEditAnnotation && (() => onEditAnnotation(hold.id)),
              },
              {
                id: "delete",
                color: "red",
                onClick: onDelete && (() => onDelete(hold.id)),
              },
            ]}
          />
        </Positioned>
      </ClickAwayListener>

      {hold.annotation && (
        <Portal>
          <Tooltip
            // On first render, ref.current will still be null. If we try to
            // show the popover then, it'll spit out an error about anchorEl
            // being null. So we need to stall it until the second render.
            open={isDefined(ref.current) && isHighlighted}
            title={hold.annotation}
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

HoldMark.defaultProps = {} as Partial<Props>;

export default HoldMark;
