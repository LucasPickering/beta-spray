import React, { useContext, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaDetailsMove_betaMoveNode$key } from "./__generated__/BetaDetailsMove_betaMoveNode.graphql";
import { XYCoord } from "react-dnd";
import { toBodyPart } from "../EditorSvg/types";
import { DragItem, DropHandler, useDrag, useDrop } from "util/dnd";
import { EditorContext } from "util/context";
import BetaMoveListItem from "./BetaMoveListItem";

interface Props {
  dataKey: BetaDetailsMove_betaMoveNode$key;
  index: number;
  disabled?: boolean;
  onReorder?: (dragItem: DragItem<"betaMoveList">, newIndex: number) => void;
  onDrop?: DropHandler<"betaMoveList">;
  onDelete?: () => void;
}

/**
 * A smart(ish) component to render one move in a list of a beta's moves.
 */
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

  const [{ isDragging }, drag] = useDrag<
    "betaMoveList",
    { isDragging: boolean }
  >({
    type: "betaMoveList",
    item: {
      betaMoveId: betaMove.id,
      index,
      bodyPart: toBodyPart(betaMove.bodyPart),
      order: betaMove.order,
    },
    canDrag() {
      return !disabled;
    },
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
    end(item) {
      if (onDrop) {
        // Second param is `result` which we don't use in this case, but let's
        // pass something just for consistency with other DnD use cases
        onDrop(item, undefined);
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
      const cursorY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // We want to make sure the dragged item is always immediately before or
      // after the hovered item, based on its position over the hoveree.
      // Top half => before
      // Bottom half => after
      // For each of those, we need to cover two sub-cases: whether or not the
      // dragee just crossed over the hoveree. E.g. these 4 cases:
      // 1. dragIndex=0, hoverIndex=4, top half    => newDragIndex=3
      // 2. dragIndex=6, hoverIndex=4, top half    => newDragIndex=4
      // 3. dragIndex=6, hoverIndex=4, bottom half => newDragIndex=5
      // 4. dragIndex=0, hoverIndex=4, bottom half => newDragIndex=4
      // In an ideal world, we would only need to cover the crossover cases,
      // but in reality some drag events gets missed on quick moves, meaning
      // you can skip over a few items and suddenly you're hovering the top half
      // of item #4 and the dragged item is still shown as item #0. Cases 1 & 3
      // above mitigate that issue.
      let newDragIndex;
      if (cursorY < hoverMiddleY) {
        if (dragIndex < hoverIndex) {
          newDragIndex = hoverIndex - 1;
        } else {
          newDragIndex = hoverIndex;
        }
      } else {
        if (dragIndex > hoverIndex) {
          newDragIndex = hoverIndex + 1;
        } else {
          newDragIndex = hoverIndex;
        }
      }

      // Block unnecessary updates
      if (newDragIndex !== dragIndex) {
        // TODO debounce calls here
        onReorder(item, newDragIndex);
        // *Warning:* We mutate the monitor state here. Not ideal, but necessary
        // to prevent constant swapping. They do it in the example so it must be
        // ok right
        // https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
        item.index = newDragIndex;
      }
    },
  });

  const bodyPart = toBodyPart(betaMove.bodyPart); // simple type conversion
  const isHighlighted = highlightedMove === betaMove.id;

  drag(drop(ref));
  return (
    <BetaMoveListItem
      ref={ref}
      bodyPart={bodyPart}
      order={betaMove.order}
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
      onDelete={onDelete}
      sx={[
        { userSelect: "none" },
        // Use opacity because we want the element to remain in the doc flow
        // and keep produce events
        isDragging && { opacity: 0 },
        isHighlighted &&
          (({ palette }) => ({
            backgroundColor: palette.action.hover,
          })),
      ]}
    />
  );
};

export default BetaDetailsMove;
