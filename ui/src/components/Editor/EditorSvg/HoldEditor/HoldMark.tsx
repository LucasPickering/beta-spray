import React, { useRef } from "react";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import { graphql, useFragment } from "react-relay";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";
import Positioned from "../Positioned";
import HoldIcon from "./HoldIcon";

interface Props {
  holdKey: HoldMark_holdNode$key;
  draggable?: boolean;
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
  onDrop?: DropHandler<"holdOverlay">;
}

const HoldMark: React.FC<Props> = ({
  holdKey,
  onClick,
  onDoubleClick,
  onDrop,
}) => {
  const hold = useFragment(
    graphql`
      fragment HoldMark_holdNode on HoldNode {
        id
        position {
          x
          y
        }
      }
    `,
    holdKey
  );
  const ref = useRef<SVGCircleElement | null>(null);

  // Drag this hold around, while editing holds
  const [{ isDragging }, drag] = useDrag<
    "holdOverlay",
    { isDragging: boolean }
  >({
    type: "holdOverlay",
    item: { holdId: hold.id },
    canDrag() {
      // Don't allow drag when holds aren't editable
      return Boolean(onDrop);
    },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end: (item, monitor) => {
      const result = monitor.getDropResult();
      if (result && onDrop) {
        onDrop(item, result);
      }
    },
  });

  // Drop *moves* onto this hold
  const [{ isOver }, drop] = useDrop<"betaMoveOverlay", { isOver: boolean }>({
    accept: "betaMoveOverlay",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Tell the dragger which hold they just dropped onto
    drop: () => ({ kind: "hold", holdId: hold.id }),
  });

  drag(drop(ref));
  return (
    <Positioned
      ref={ref}
      position={hold.position}
      onClick={onClick && (() => onClick(hold.id))}
      onDoubleClick={onDoubleClick && (() => onDoubleClick(hold.id))}
    >
      <HoldIcon
        clickable={Boolean(onClick)}
        draggable={Boolean(onDrop)}
        isDragging={isDragging}
        isOver={isOver}
      />
    </Positioned>
  );
};

HoldMark.defaultProps = {} as Partial<Props>;

export default HoldMark;
