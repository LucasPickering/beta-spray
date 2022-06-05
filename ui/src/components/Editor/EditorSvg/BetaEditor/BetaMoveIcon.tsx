import React from "react";
import { BetaOverlayMove, multiply, unit } from "util/svg";
import {
  startHashLength,
  styleDraggable,
  styleDraggableHighlight,
  styleDragging,
} from "styles/svg";
import { Interpolation, Theme } from "@emotion/react";
import { IconBodyPartRaw } from "components/common/icons";

interface Props extends React.SVGProps<SVGGElement> {
  move: BetaOverlayMove;
  hideOrder?: boolean;
  isDragging?: boolean;
  isHighlighted?: boolean;
  css?: Interpolation<Theme>;
}

/**
 * Dumb component representing a beta move.
 *
 * TODO rename this to something less confusing (remove the Icon word)
 */
const BetaMoveIcon = React.forwardRef<SVGGElement, Props>(
  (
    { move, hideOrder, isDragging, isHighlighted, css: parentCss, ...rest },
    ref
  ) => {
    // For start moves, we'll draw a hashmark akin to what routesetters use.
    // We want the hash to move away from the center of the hold so it doesn't
    // cover anything (also aesthetically matches hashes on holds). We'll put
    // one line at the circle center and just hide it behind the circle, and
    // we'll just use the move's visual offset to figure out which direction to
    // put the other end in.
    const hashStart = { x: 0, y: 0 };
    // We don't want hash length to change if we happen to change the offset
    // distance, so scale the offset down to a unit vector, then scale up again
    // by a known length factor. Note: this length includes the segment hidden
    // behind the circle.
    const hashEnd = multiply(unit(move.offset), startHashLength);

    // Applied to both the main icon and the hash mark
    const strokeStyles = {
      ...move.color,
      strokeWidth: 0.5,
    };

    return (
      <g
        ref={ref}
        css={[
          styleDraggable,
          isDragging && styleDragging,
          isHighlighted && styleDraggableHighlight,
          parentCss,
        ]}
        {...rest}
      >
        {move.isStart && (
          // Hash mark on start moves
          <line
            css={strokeStyles}
            x1={hashStart.x}
            y1={hashStart.y}
            x2={hashEnd.x}
            y2={hashEnd.y}
          />
        )}

        <g css={{ transform: "scale(1.5)" }}>
          <IconBodyPartRaw bodyPart={move.bodyPart} css={strokeStyles} />
        </g>

        {!hideOrder && (
          <text
            css={{
              fontSize: 4,
              userSelect: "none",
              pointerEvents: "none",
              // This should contrast all possible fill colors
              color: "black",
            }}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {move.order}
          </text>
        )}
      </g>
    );
  }
);

BetaMoveIcon.displayName = "BetaMoveIcon";

export default BetaMoveIcon;
