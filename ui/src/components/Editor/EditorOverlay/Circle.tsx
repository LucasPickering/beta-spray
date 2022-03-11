import React from "react";
import { OverlayPosition } from "./types";
import classes from "./Circle.scss";
import Positioned from "./Positioned";

interface Props extends React.SVGProps<SVGCircleElement> {
  className?: string;
  position: OverlayPosition;
  innerLabel?: string;
  outerLabel?: string;
}

const Circle = React.forwardRef<SVGCircleElement, Props>(
  ({ className, position, innerLabel, outerLabel, ...rest }, ref) => (
    <Positioned position={position}>
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
    </Positioned>
  )
);

Circle.displayName = "Circle";

export default Circle;
