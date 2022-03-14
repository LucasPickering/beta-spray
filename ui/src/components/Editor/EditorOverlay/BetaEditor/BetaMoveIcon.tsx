import React from "react";
import { BodyPart, formatOrder } from "../types";
import {
  styleDraggable,
  styleDraggableHighlight,
  styleDragging,
} from "styles/dnd";
import { useTheme } from "@mui/material";
import { betaMoveCircleRadius } from "../consts";
import { isDefined } from "util/func";

interface Props {
  bodyPart: BodyPart;
  order?: number;
  isDragging?: boolean;
  isHighlighted?: boolean;
}

/**
 * Dumb component representing a beta move.
 */
const BetaChainMark: React.FC<Props> = React.forwardRef<
  SVGCircleElement,
  Props
>(({ bodyPart, order, isDragging, isHighlighted }, ref) => {
  const { palette } = useTheme();
  const color = palette.bodyParts[bodyPart];

  return (
    <>
      <circle
        ref={ref}
        css={[
          { fill: color },
          styleDraggable,
          isDragging && styleDragging,
          isHighlighted && styleDraggableHighlight,
        ]}
        r={betaMoveCircleRadius}
      />

      {isDefined(order) && (
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
          {formatOrder(order)}
        </text>
      )}
    </>
  );
});

BetaChainMark.displayName = "BetaChainMark";

export default BetaChainMark;
