import React, { useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaDetailsMove_betaMoveNode$key } from "./__generated__/BetaDetailsMove_betaMoveNode.graphql";
import classes from "./BetaDetailsMove.scss";
import { XYCoord } from "react-dnd";
import clsx from "clsx";
import { HiX } from "react-icons/hi";
import { IconButton } from "@chakra-ui/react";
import { formatBodyPart, toBodyPart } from "../EditorOverlay/types";
import { useDrag, useDrop } from "util/dnd";

interface Props {
  dataKey: BetaDetailsMove_betaMoveNode$key;
  onReorder?: (newIndex: number) => void;
  onSaveOrder?: () => void;
  onDelete?: () => void;
}

const BetaDetailsMove: React.FC<Props> = ({
  dataKey,
  onReorder,
  onSaveOrder,
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
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
    end() {
      if (onSaveOrder) {
        onSaveOrder();
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

      const dragOrder = item.order;
      const hoverOrder = betaMove.order;

      // Don't replace items with themselves
      if (dragOrder === hoverOrder) {
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
      if (dragOrder < hoverOrder && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragOrder > hoverOrder && hoverClientY > hoverMiddleY) {
        return;
      }

      onReorder(hoverOrder);
    },
  });

  drag(drop(ref));
  return (
    <li ref={ref} className={clsx(classes.betaDetailsMove)}>
      <span>
        {betaMove.order + 1} - {formatBodyPart(toBodyPart(betaMove.bodyPart))}
      </span>

      <IconButton
        aria-label={`delete move #${betaMove.order + 1}`}
        icon={<HiX />}
        onClick={onDelete}
      />
    </li>
  );
};

export default BetaDetailsMove;
