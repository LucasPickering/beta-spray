import React, { useContext, useRef } from "react";
import { BetaOverlayMove, formatOrder } from "../types";
import { DropHandler, useDrag, useDrop } from "util/dnd";
import {
  styleDraggable,
  styleDraggableHighlight,
  styleDragging,
  styleDropHover,
} from "styles/dnd";
import { useTheme } from "@mui/material";
import EditorContext from "context/EditorContext";
import Positioned from "../Positioned";
import { betaMoveCircleRadius } from "../consts";

interface Props {
  move: BetaOverlayMove;
  isLast: boolean;
  onDrop?: DropHandler<"betaMoveOverlay">;
  onClick?: (move: BetaOverlayMove) => void;
  onDoubleClick?: (move: BetaOverlayMove) => void;
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
  onMouseEnter,
  onMouseLeave,
}) => {
  const { palette, transitions } = useTheme();
  const ref = useRef<SVGCircleElement | null>(null);

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
  const color = palette.bodyParts[move.bodyPart];

  drag(drop(ref));
  return (
    <Positioned position={move.position}>
      {/* This wrapper allows for applying transforms to all children */}
      <g
        css={[
          {
            transform: "translate(0px, 0px)",
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
      >
        <circle
          ref={ref}
          css={[
            { fill: color },
            styleDraggable,
            isDragging && styleDragging,
            isHighlighted && styleDraggableHighlight,
          ]}
          r={betaMoveCircleRadius}
          onClick={onClick && (() => onClick(move))}
          onDoubleClick={onDoubleClick && (() => onDoubleClick(move))}
          onMouseEnter={onMouseEnter && (() => onMouseEnter(move))}
          onMouseLeave={onMouseLeave && (() => onMouseLeave(move))}
        />

        <text
          css={{
            fontSize: 3,
            userSelect: "none",
            pointerEvents: "none",
            color: palette.getContrastText(color),
          }}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {formatOrder(move.order)}
        </text>
      </g>
    </Positioned>
  );
};

BetaChainMark.defaultProps = {} as Partial<Props>;

export default BetaChainMark;
