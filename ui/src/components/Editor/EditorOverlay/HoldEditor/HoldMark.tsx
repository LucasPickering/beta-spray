import React, { useRef } from "react";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import { graphql, useFragment } from "react-relay";
import { useOverlayUtils } from "util/useOverlayUtils";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";
import Positioned from "../Positioned";
import { IconTriangle } from "components/icons";
import { css } from "@emotion/react";
import {
  styleAddObject,
  styleDraggable,
  styleDragging,
  styleDropHover,
} from "styles/dnd";

interface Props {
  holdKey: HoldMark_holdNode$key;
  draggable?: boolean;
  unhighlight?: boolean;
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
  onDrop?: DropHandler<"holdOverlay">;
}

const styleHoldMark = css({
  fill: "white",
  stroke: "white",
  strokeWidth: 0.3,
});
const styleUnhighlight = css({
  fill: "gray",
  stroke: "gray",
});

const HoldMark: React.FC<Props> = ({
  holdKey,
  unhighlight = false,
  onClick,
  onDoubleClick,
  onDrop,
}) => {
  const hold = useFragment(
    graphql`
      fragment HoldMark_holdNode on HoldNode {
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
  const [{ isDragging }, drag] = useDrag<
    "holdOverlay",
    { isDragging: boolean }
  >({
    type: "holdOverlay",
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
  const [{ isOver }, drop] = useDrop<"betaMoveOverlay", { isOver: boolean }>({
    // TODO don't allow drop if move is already on this hold
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
      css={[
        styleHoldMark,
        unhighlight && styleUnhighlight,
        onClick && styleAddObject,
        onDrop && styleDraggable,
        isDragging && styleDragging,
        isOver && styleDropHover,
      ]}
      position={position}
    >
      <IconTriangle />
      {/* Invisible hitbox, for easier clicking. Has to be on top! */}
      <circle
        ref={ref}
        r={2}
        opacity={0}
        onClick={onClick && (() => onClick(hold.id))}
        onDoubleClick={onDoubleClick && (() => onDoubleClick(hold.id))}
      />
    </Positioned>
  );
};

HoldMark.defaultProps = {} as Partial<Props>;

export default HoldMark;
