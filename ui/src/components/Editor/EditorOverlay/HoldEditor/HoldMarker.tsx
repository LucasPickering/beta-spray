import clsx from "clsx";
import React from "react";
import { useDrop } from "react-dnd";
import { DndDragItem, DndDropResult } from "../types";
import { DragType } from "util/dnd";
import Circle from "../Circle";
import classes from "./HoldMarker.scss";
import commonClasses from "../common.scss";
import { graphql, useFragment } from "react-relay";
import { useOverlayUtils } from "util/useOverlayUtils";
import { HoldMarker_holdNode$key } from "./__generated__/HoldMarker_holdNode.graphql";

interface Props {
  className?: string;
  holdKey: HoldMarker_holdNode$key;
  onDoubleClick?: (holdId: string) => void;
}

const HoldMarker: React.FC<Props> = ({ className, holdKey, onDoubleClick }) => {
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
  const { toOverlayPosition } = useOverlayUtils();
  const position = toOverlayPosition(hold);

  const [{ isOver }, drop] = useDrop<
    DndDragItem,
    DndDropResult,
    { isOver: boolean }
  >(() => ({
    // TODO don't allow drop if move is already on this hold
    accept: DragType.BetaMoveSvg,
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Tell the dragger which hold they just dropped onto
    drop: () => ({ kind: "hold", holdId: hold.id }),
  }));

  return (
    <Circle
      ref={drop}
      className={clsx(
        classes.holdMarker,
        isOver && commonClasses.dropHover,
        className
      )}
      position={position}
      onDoubleClick={onDoubleClick && (() => onDoubleClick(hold.id))}
    />
  );
};

HoldMarker.defaultProps = {} as Partial<Props>;

export default HoldMarker;
