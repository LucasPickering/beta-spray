import { useRef } from "react";
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
import { useHighlight } from "components/Editor/util/highlight";
import { Portal, Tooltip } from "@mui/material";
import { isDefined } from "util/func";

interface Props {
  holdKey: HoldMark_holdNode$key;
  onClick?: (holdId: string) => void;
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
  onClick,
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

  const clickable = isDefined(onClick); // TODO animations based on this
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

  const [highlightedHoldId] = useHighlight("hold");
  const isHighlighted = highlightedHoldId === hold.id;

  drag(drop(ref));
  return (
    <>
      <Positioned
        ref={ref}
        position={hold.position}
        onClick={onClick && (() => onClick(hold.id))}
      >
        <HoldIcon
          draggable={draggable}
          isDragging={isDragging}
          isOver={isOver}
          isHighlighted={isHighlighted}
        />
      </Positioned>

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
