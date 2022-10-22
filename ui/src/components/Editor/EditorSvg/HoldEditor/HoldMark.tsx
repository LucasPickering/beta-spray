import { useRef } from "react";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import { graphql, useFragment } from "react-relay";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";
import Positioned from "../common/Positioned";
import HoldIcon from "./HoldIcon";

interface Props {
  holdKey: HoldMark_holdNode$key;
  draggable?: boolean;
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
  onDrop?: DropHandler<"overlayBetaMove", "hold">;
}

/**
 * An editable hold, in the context of the full interface editor.
 */
const HoldMark: React.FC<Props> = ({
  holdKey,
  onClick,
  onDoubleClick,
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
      }
    `,
    holdKey
  );

  // Drag this hold around, while editing holds
  const [{ isDragging }, drag] = useDrag<
    "overlayHold",
    { isDragging: boolean }
  >({
    type: "overlayHold",
    item: { action: "relocate", holdId: hold.id },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
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
