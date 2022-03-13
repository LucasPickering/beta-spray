import React, { useRef } from "react";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import { graphql, useFragment } from "react-relay";
import { useOverlayUtils } from "util/useOverlayUtils";
import { HoldMarker_holdNode$key } from "./__generated__/HoldMarker_holdNode.graphql";
import Positioned from "../Positioned";
import { IconTriangle } from "components/icons";
import { css } from "@emotion/react";
import { styleDraggable, styleDragging, styleDropHover } from "styles/dnd";

interface Props {
  holdKey: HoldMarker_holdNode$key;
  draggable?: boolean;
  unhighlight?: boolean;
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
  onDrop?: DropHandler<"holdSvg">;
}

const styleHoldMarker = css({
  fill: "white",
  stroke: "white",
  strokeWidth: 0.3,
});
const styleUnhighlight = css({
  fill: "gray",
  stroke: "gray",
});
const styleClickable = css({
  cursor: "pointer",
});

const HoldMarker: React.FC<Props> = ({
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
      css={[
        styleHoldMarker,
        unhighlight && styleUnhighlight,
        onClick && styleClickable,
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

HoldMarker.defaultProps = {} as Partial<Props>;

export default HoldMarker;
