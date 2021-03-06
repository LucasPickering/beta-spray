import React, { useContext, useEffect, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaDetailsMove_betaMoveNode$key } from "./__generated__/BetaDetailsMove_betaMoveNode.graphql";
import { XYCoord } from "react-dnd";
import { DragItem, DropHandler, useDrag, useDrop } from "util/dnd";
import { EditorHighlightedMoveContext } from "util/context";
import BetaMoveListItem from "./BetaMoveListItem";

interface Props {
  betaMoveKey: BetaDetailsMove_betaMoveNode$key;
  index: number;
  totalMoves: number;
  disabled?: boolean;
  onReorder?: (dragItem: DragItem<"betaMoveList">, newIndex: number) => void;
  onDrop?: DropHandler<"betaMoveList">;
  onDelete?: () => void;
}

/**
 * A smart(ish) component to render one move in a list of a beta's moves.
 */
const BetaDetailsMove: React.FC<Props> = ({
  betaMoveKey,
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
        ...BetaMoveListItem_betaMoveNode
      }
    `,
    betaMoveKey
  );

  const [highlightedMove, setHighlightedMove] = useContext(
    EditorHighlightedMoveContext
  );

  const dragHandleRef = useRef<SVGSVGElement | null>(null);

  const [{ isDragging }, drag] = useDrag<
    "betaMoveList",
    { isDragging: boolean }
  >({
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
      if (onDrop) {
        // Second param is `result` which we don't use in this case, but let's
        // pass it just for consistency with other DnD use cases
        onDrop(item, monitor.getDropResult() ?? undefined);
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
      if (!dragHandleRef.current || !onReorder) {
        return;
      }

      // Remember - this function is called for the *hovered* element, `item`
      // refers to the element being dragged
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = dragHandleRef.current.getBoundingClientRect();

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
      // 1. dragIndex=1, hoverIndex=4, top half    => newDragIndex=3
      // 2. dragIndex=6, hoverIndex=4, top half    => newDragIndex=4
      // 3. dragIndex=6, hoverIndex=4, bottom half => newDragIndex=5
      // 4. dragIndex=1, hoverIndex=4, bottom half => newDragIndex=4
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
        onReorder(item, newDragIndex);
        // *Warning:* We mutate the monitor state here. Not ideal, but necessary
        // to prevent constant swapping. They do it in the example so it must be
        // ok right
        // https://github.com/react-dnd/react-dnd/blob/main/packages/examples/src/04-sortable/simple/Card.tsx
        item.index = newDragIndex;
      }
    },
  });

  const isHighlighted = highlightedMove === betaMove.id;

  // Scroll the highlighted move into view
  useEffect(() => {
    if (dragHandleRef.current && isHighlighted) {
      dragHandleRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isHighlighted]);

  drag(drop(dragHandleRef));
  return (
    <BetaMoveListItem
      ref={dragHandleRef}
      betaMoveKey={betaMove}
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
