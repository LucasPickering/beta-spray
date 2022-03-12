import clsx from "clsx";
import React, { useRef } from "react";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import classes from "./HoldMarker.scss";
import commonClasses from "../common.scss";
import { graphql, useFragment } from "react-relay";
import { useOverlayUtils } from "util/useOverlayUtils";
import { HoldMarker_holdNode$key } from "./__generated__/HoldMarker_holdNode.graphql";
import Positioned from "../Positioned";
import { IconX } from "components/icons";

interface Props {
  className?: string;
  holdKey: HoldMarker_holdNode$key;
  draggable?: boolean;
  unhighlight?: boolean;
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
  onDrop?: DropHandler<"holdSvg">;
}

const HoldMarker: React.FC<Props> = ({
  className,
  holdKey,
  unhighlight = false,
  onClick,
  onDoubleClick,
  onDrop,
}) => {
  const hold = useFragment(
    graphql`
      fragment HoldMarker_holdNode on HoldNode {
        id
        positionX
        positionY
      }
    `,
    holdKey
  );
  const ref = useRef<SVGCircleElement | null>(null);
  const { toOverlayPosition } = useOverlayUtils();
  const position = toOverlayPosition(hold);

  // Drag this hold around, while editing holds
  const [{ isDragging }, drag] = useDrag<"holdSvg", { isDragging: boolean }>({
    type: "holdSvg",
    item: { holdId: hold.id },
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
  const [{ isOver }, drop] = useDrop<"betaMoveSvg", { isOver: boolean }>({
    // TODO don't allow drop if move is already on this hold
    accept: "betaMoveSvg",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Tell the dragger which hold they just dropped onto
    drop: () => ({ kind: "hold", holdId: hold.id }),
  });

  drag(drop(ref));
  return (
    <Positioned
      className={clsx(
        classes.holdMarker,
        unhighlight && classes.unhighlight,
        onDrop && commonClasses.draggable,
        isDragging && commonClasses.dragging,
        isOver && commonClasses.dropHover,
        onClick && classes.interact,
        className
      )}
      position={position}
    >
      <IconX
        onClick={onClick && (() => onClick(hold.id))}
        onDoubleClick={onDoubleClick && (() => onDoubleClick(hold.id))}
      />
      {/* Invisible hitbox, for easier clicking. Has to be on top! */}
      <circle ref={ref} r={2} opacity={0} />
    </Positioned>
  );
};

HoldMarker.defaultProps = {} as Partial<Props>;

export default HoldMarker;
