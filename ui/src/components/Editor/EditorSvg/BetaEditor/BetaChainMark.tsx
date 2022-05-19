import React, { useContext, useRef } from "react";
import { BetaOverlayMove, getMoveVisualPosition } from "util/svg";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import { styleDropHover } from "styles/dnd";
import { ClickAwayListener } from "@mui/material";
import { EditorContext } from "util/context";
import Positioned from "../Positioned";
import { noop } from "util/func";
import BetaMoveIcon from "./BetaMoveIcon";

interface Props {
  move: BetaOverlayMove;
  isLast: boolean;
  onDrop?: DropHandler<"betaMoveOverlay">;
  onClick?: (move: BetaOverlayMove) => void;
  onDoubleClick?: (move: BetaOverlayMove) => void;
  onClickAway?: (move: BetaOverlayMove) => void;
  onMouseEnter?: (move: BetaOverlayMove) => void;
  onMouseLeave?: (move: BetaOverlayMove) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainMark: React.FC<Props> = ({
  move,
  isLast,
  onDrop,
  onClick,
  onDoubleClick,
  onClickAway,
  onMouseEnter,
  onMouseLeave,
}) => {
  const ref = useRef<SVGCircleElement>(null);

  const [{ isDragging }, drag] = useDrag<
    "betaMoveOverlay",
    { isDragging: boolean }
  >({
    type: "betaMoveOverlay",
    item: { kind: "move", move, isLast },
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

  // Move is a drop target, just aliases to the underlying hold
  const [{ isOver }, drop] = useDrop<"betaMoveOverlay", { isOver: boolean }>({
    accept: "betaMoveOverlay",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Tell the dragger which hold they just dropped onto
    drop: () => ({ kind: "hold", holdId: move.holdId }),
  });

  const { highlightedMove } = useContext(EditorContext);
  const isHighlighted = highlightedMove === move.id;

  drag(drop(ref));
  return (
    <ClickAwayListener
      // Listen for leading edge of event, to catch drags as well
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={onClickAway ? () => onClickAway(move) : noop}
    >
      <Positioned position={getMoveVisualPosition(move)}>
        {/* This wrapper allows for applying transforms to all children */}
        <g
          css={isOver && styleDropHover}
          onClick={onClick && (() => onClick(move))}
          onDoubleClick={onDoubleClick && (() => onDoubleClick(move))}
          onMouseEnter={onMouseEnter && (() => onMouseEnter(move))}
          onMouseLeave={onMouseLeave && (() => onMouseLeave(move))}
        >
          <BetaMoveIcon
            ref={ref}
            bodyPart={move.bodyPart}
            order={move.order}
            isDragging={isDragging}
            isHighlighted={isHighlighted}
          />
        </g>
      </Positioned>
    </ClickAwayListener>
  );
};

export default BetaChainMark;
