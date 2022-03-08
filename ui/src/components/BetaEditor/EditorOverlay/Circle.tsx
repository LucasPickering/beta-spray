import React from "react";
import { DragType } from "util/dnd";
import { OverlayPosition } from "./types";
import classes from "./Circle.scss";

interface Props extends React.SVGProps<SVGCircleElement> {
  className?: string;
  position: OverlayPosition;
  innerLabel?: string;
  outerLabel?: string;
  dragType?: DragType;
}

const Circle = React.forwardRef<SVGCircleElement, Props>(
  ({ className, position, innerLabel, outerLabel, ...rest }, ref) => (
    <g
      transform={`translate(${position.x},${position.y})`}
      transform-origin={`${position.x} ${position.y}`}
    >
      <circle ref={ref} className={className} r={2} {...rest} />

      {innerLabel && (
        <text
          className={classes.text}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {innerLabel}
        </text>
      )}

      {outerLabel && (
        <text className={classes.text} x={2} y={2}>
          {outerLabel}
        </text>
      )}
    </g>
  )
);

Circle.displayName = "Circle";

export default Circle;
