import { useEffect, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaDetailsMove_betaMoveNode$key } from "./__generated__/BetaDetailsMove_betaMoveNode.graphql";
import { XYCoord } from "react-dnd";
import { DragItem, DropHandler, useDrag, useDrop } from "util/dnd";
import BetaMoveListItem from "./BetaMoveListItem";
import useHighlight from "util/useHighlight";

interface Props {
  betaMoveKey: BetaDetailsMove_betaMoveNode$key;
  index: number;
  totalMoves: number;
  disabled?: boolean;
  onReorder?: (dragItem: DragItem<"listBetaMove">, newIndex: number) => void;
  onDrop?: DropHandler<"listBetaMove", "list">;
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

  const [highlightedMove, setHighlightedMove] = useHighlight("move");

  const childRef = useRef<HTMLLIElement | null>(null);

  const [{ isDragging }, drag] = useDrag<
    "listBetaMove",
    { isDragging: boolean }
  >({
    type: "listBetaMove",
    item: { betaMoveId: betaMove.id, index },
    canDrag() {
      return !disabled;
    },
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
  });

  // Use DnD for sortability
  // https://react-dnd.github.io/react-dnd/examples/sortable/simple
  const [, drop] = useDrop<"listBetaMove", { isOver: boolean }>({
    accept: "listBetaMove",
    collect(monitor) {
      return {
        isOver: Boolean(monitor.isOver()),
      };
    },
    hover(item, monitor) {
      if (!childRef.current || !onReorder) {
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
      const hoverBoundingRect = childRef.current.getBoundingClientRect();

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
    drop(item, monitor) {
      const result = { kind: "list" } as const;
      if (onDrop) {
        onDrop(item, result, monitor);
      }
      return result;
    },
  });

  const isHighlighted = highlightedMove?.betaMoveId === betaMove.id;

  // Scroll the highlighted move into view
  useEffect(() => {
    if (childRef.current && isHighlighted) {
      childRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [isHighlighted]);

  // We want the *entire child* to be the drop target. But only the drag handle
  // element should be a drag target. Otherwise we'd interfere with scrolling
  // on mobile
  drop(childRef);
  return (
    <BetaMoveListItem
      ref={childRef}
      dragRef={drag}
      betaMoveKey={betaMove}
      disabled={disabled}
      onMouseEnter={() => {
        if (!disabled) {
          setHighlightedMove({ betaMoveId: betaMove.id });
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
