import React from "react";
import { BetaOverlayMove, formatOrder } from "util/svg";
import {
  styleDraggable,
  styleDraggableHighlight,
  styleDragging,
} from "styles/dnd";

interface Props {
  move: BetaOverlayMove;
  hideOrder?: boolean;
  isDragging?: boolean;
  isHighlighted?: boolean;
}

/**
 * Dumb component representing a beta move.
 */
const BetaMoveIcon = React.forwardRef<SVGCircleElement, Props>(
  ({ move, hideOrder, isDragging, isHighlighted }, ref) => (
    <>
      <circle
        ref={ref}
        css={[
          { fill: move.color },
          styleDraggable,
          isDragging && styleDragging,
          isHighlighted && styleDraggableHighlight,
        ]}
        r={2}
      />

      {!hideOrder && (
        <text
          css={{
            fontSize: 3,
            userSelect: "none",
            pointerEvents: "none",
            // This should contrast all possible fill colors
            color: "black",
          }}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {formatOrder(move.order)}
        </text>
      )}
    </>
  )
);

BetaMoveIcon.displayName = "BetaMoveIcon";

export default BetaMoveIcon;
