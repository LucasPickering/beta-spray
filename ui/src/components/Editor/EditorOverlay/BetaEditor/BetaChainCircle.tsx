import React, { useContext } from "react";
import { BetaOverlayMove, formatOrder } from "../types";
import { DropHandler, useDrag } from "util/dnd";
import { styleDraggable, styleDragging } from "styles/dnd";
import { useTheme } from "@mui/material";
import EditorContext from "context/EditorContext";
import Positioned from "../Positioned";
import { betaMoveCircleRadius } from "../consts";

interface Props {
  move: BetaOverlayMove;
  isLast: boolean;
  onDrop?: DropHandler<"betaMoveOverlay">;
  onDoubleClick?: (move: BetaOverlayMove) => void;
  onMouseEnter?: (move: BetaOverlayMove) => void;
  onMouseLeave?: (move: BetaOverlayMove) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainCircle: React.FC<Props> = ({
  move,
  isLast,
  onDrop,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { palette, transitions } = useTheme();
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
  const { highlightedMove } = useContext(EditorContext);
  const isHighlighted = highlightedMove === move.id;

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
        ]}
      >
        <circle
          ref={drag}
          css={[
            { fill: palette.bodyParts[move.bodyPart] },
            styleDraggable,
            isDragging && styleDragging,
            isHighlighted && { fill: "white" },
          ]}
          r={betaMoveCircleRadius}
          onDoubleClick={onDoubleClick && (() => onDoubleClick(move))}
          onMouseEnter={onMouseEnter && (() => onMouseEnter(move))}
          onMouseLeave={onMouseLeave && (() => onMouseLeave(move))}
        />

        <text
          css={{
            fontSize: 3,
            userSelect: "none",
            pointerEvents: "none",
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

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
