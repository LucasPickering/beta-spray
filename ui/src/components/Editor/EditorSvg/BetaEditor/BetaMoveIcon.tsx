import React from "react";
import { BodyPart, formatOrder } from "util/svg";
import {
  styleDraggable,
  styleDraggableHighlight,
  styleDragging,
} from "styles/dnd";
import { useTheme } from "@mui/material";
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
const BetaMoveIcon = React.forwardRef<SVGCircleElement, Props>(
  ({ bodyPart, order, isDragging, isHighlighted }, ref) => {
    const { palette } = useTheme();
    const color = palette[bodyPart];

    return (
      <>
        <circle
          ref={ref}
          css={[
            { fill: color.main },
            styleDraggable,
            isDragging && styleDragging,
            isHighlighted && styleDraggableHighlight,
          ]}
          r={2}
        />

        {isDefined(order) && (
          <text
            css={{
              fontSize: 3,
              userSelect: "none",
              pointerEvents: "none",
              color: color.contrastText,
            }}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {formatOrder(order)}
          </text>
        )}
      </>
    );
  }
);

BetaMoveIcon.displayName = "BetaMoveIcon";

export default BetaMoveIcon;
