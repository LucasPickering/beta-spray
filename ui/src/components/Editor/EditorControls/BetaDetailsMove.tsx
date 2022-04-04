import React, { useContext, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaDetailsMove_betaMoveNode$key } from "./__generated__/BetaDetailsMove_betaMoveNode.graphql";
import { XYCoord } from "react-dnd";
import {
  DragHandle as IconDragHandle,
  Close as IconClose,
} from "@mui/icons-material";
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import {
  formatBodyPart,
  formatOrder,
  toBodyPart,
} from "../EditorOverlay/types";
import { DragItem, DropHandler, useDrag, useDrop } from "util/dnd";
import EditorContext from "context/EditorContext";

interface Props {
  dataKey: BetaDetailsMove_betaMoveNode$key;
  index: number;
  disabled?: boolean;
  onReorder?: (dragItem: DragItem<"betaMoveList">) => void;
  onDrop?: DropHandler<"betaMoveList">;
  onDelete?: () => void;
}

const BetaDetailsMove: React.FC<Props> = ({
  dataKey,
  index,
  disabled = false,
  onReorder,
  onDrop,
  onDelete,
}) => {
  const betaMove = useFragment(
    graphql`
      fragment BetaDetailsMove_betaMoveNode on BetaMoveNode {
        id
        bodyPart
        order
      }
    `,
    dataKey
  );

  const { highlightedMove, setHighlightedMove } = useContext(EditorContext);

  const ref = useRef<SVGSVGElement | null>(null);

  const [, drag] = useDrag<"betaMoveList", { isDragging: boolean }>({
    type: "betaMoveList",
    item: { betaMoveId: betaMove.id, index },
    canDrag() {
      return !disabled;
    },
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
    end(item, monitor) {
      const result = monitor.getDropResult();
      if (onDrop && result) {
        onDrop(item, result);
      }
    },
  });

  // Use DnD for sortability
  // https://react-dnd.github.io/react-dnd/examples/sortable/simple
  const [, drop] = useDrop<"betaMoveList", { isOver: boolean }>({
    accept: "betaMoveList",
    collect(monitor) {
      return {
        isOver: Boolean(monitor.isOver()),
      };
    },
    hover(item, monitor) {
      if (!ref.current || !onReorder) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onReorder(item);
      // *Warning:* We mutate the monitor state here. Not ideal, but necessary
      // to prevent constant swapping. They do it in the example so it must be
      // ok right
      // https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
      item.index = hoverIndex;
    },
  });

  const bodyPart = toBodyPart(betaMove.bodyPart); // simple type conversion
  const isHighlighted = highlightedMove === betaMove.id;

  drag(drop(ref));
  return (
    <ListItem
      disabled={disabled}
      onMouseEnter={() => {
        if (!disabled) {
          setHighlightedMove(betaMove.id);
        }
      }}
      onMouseLeave={() => {
        if (!disabled) {
          // Only clear the highlight if we "own" it
          setHighlightedMove((old) => (betaMove.id === old ? undefined : old));
        }
      }}
      sx={[
        { userSelect: "none" },
        isHighlighted &&
          (({ palette }) => ({
            backgroundColor: palette.action.hover,
          })),
      ]}
    >
      {/* Limit the dnd to just the handle icon, to not interfere with scrolling
      on mobile */}
      <ListItemIcon>
        <IconDragHandle ref={ref} sx={[!disabled && { cursor: "move" }]} />
      </ListItemIcon>

      <ListItemText
        sx={({ palette }) => ({ color: palette.bodyParts[bodyPart] })}
      >
        {formatOrder(betaMove.order)} {formatBodyPart(bodyPart)}
      </ListItemText>

      <ListItemSecondaryAction>
        <IconButton
          aria-label={`delete move ${formatOrder(betaMove.order)}`}
          size="small"
          disabled={disabled}
          onClick={onDelete}
        >
          <IconClose />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default BetaDetailsMove;
