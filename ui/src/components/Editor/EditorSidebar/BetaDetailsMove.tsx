import React, { useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaDetailsMove_betaMoveNode$key } from "./__generated__/BetaDetailsMove_betaMoveNode.graphql";
import { XYCoord } from "react-dnd";
import { HiMenuAlt4, HiX } from "react-icons/hi";
import { IconButton, ListItem, Text } from "@chakra-ui/react";
import {
  formatBodyPart,
  formatOrder,
  toBodyPart,
} from "../EditorOverlay/types";
import { DragItem, DropResult, useDrag, useDrop } from "util/dnd";

interface Props {
  dataKey: BetaDetailsMove_betaMoveNode$key;
  index: number;
  onReorder?: (dragItem: DragItem<"betaMoveList">) => void;
  onDrop?: (
    item: DragItem<"betaMoveList">,
    dropResult: DropResult<"betaMoveList">
  ) => void;
  onDelete?: () => void;
}

const BetaDetailsMove: React.FC<Props> = ({
  dataKey,
  index,
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

  const ref = useRef<HTMLLIElement | null>(null);

  const [, drag] = useDrag<"betaMoveList", { isDragging: boolean }>({
    type: "betaMoveList",
    item: { betaMoveId: betaMove.id, index },
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

  drag(drop(ref));
  return (
    <ListItem
      ref={ref}
      display="flex"
      alignItems="center"
      cursor="move"
      userSelect="none"
    >
      <HiMenuAlt4 />
      <Text marginLeft={2} color={`bodyPart_${betaMove.bodyPart}`}>
        {formatOrder(betaMove.order)}{" "}
        {formatBodyPart(toBodyPart(betaMove.bodyPart))}
      </Text>

      <IconButton
        aria-label={`delete move ${formatOrder(betaMove.order)}`}
        icon={<HiX />}
        size="sm"
        marginLeft="auto"
        onClick={onDelete}
      />
    </ListItem>
  );
};

export default BetaDetailsMove;
