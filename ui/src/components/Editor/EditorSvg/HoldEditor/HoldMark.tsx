import React, { useRef } from "react";
import { useDrag, useDrop } from "util/dnd";
import { graphql, useFragment } from "react-relay";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";
import Positioned from "../Positioned";
import HoldIcon from "./HoldIcon";

interface Props {
  holdKey: HoldMark_holdNode$key;
  draggable?: boolean;
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
}

/**
 * An editable hold, in the context of the full interface editor.
 */
const HoldMark: React.FC<Props> = ({ holdKey, onClick, onDoubleClick }) => {
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
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
  });

  // Drop *moves* onto this hold
  const [{ isOver }, drop] = useDrop<"betaMoveOverlay", { isOver: boolean }>({
    accept: "betaMoveOverlay",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
  });

  drag(drop(ref));
  return (
    <Positioned
      ref={ref}
      position={hold.position}
      onClick={onClick && (() => onClick(hold.id))}
      onDoubleClick={onDoubleClick && (() => onDoubleClick(hold.id))}
    >
      <HoldIcon draggable isDragging={isDragging} isOver={isOver} />
    </Positioned>
  );
};

HoldMark.defaultProps = {} as Partial<Props>;

export default HoldMark;
