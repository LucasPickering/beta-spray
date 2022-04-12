import React, { useContext, useRef } from "react";
import { BetaOverlayMove } from "../types";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import { styleDropHover } from "styles/dnd";
import { ClickAwayListener, useTheme } from "@mui/material";
import EditorContext from "context/EditorContext";
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
  const { transitions } = useTheme();
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
    // TODO don't allow drop if move is already on this hold
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
      onClickAway={onClickAway ? () => onClickAway(move) : noop}
    >
      <Positioned position={move.position}>
        {/* This wrapper allows for applying transforms to all children */}
        <g
          css={[
            {
              // Animate movement of highlight
              transition: transitions.create("transform", {
                duration: transitions.duration.standard,
              }),
            },
            move.offset && {
              // Slide a bit for disambiguation
              transform: `translate(${move.offset.x}px, ${move.offset.y}px)`,
            },
            isOver && styleDropHover,
          ]}
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
