import React from "react";
import { DragType } from "util/dnd";
import { OverlayPosition } from "./types";

interface Props extends React.SVGProps<SVGCircleElement> {
  className?: string;
  position: OverlayPosition;
  dragType?: DragType;
}

const Circle = React.forwardRef<SVGCircleElement, Props>(
  ({ className, position, ...rest }, ref) => (
    <circle
      ref={ref}
      className={className}
      r={2}
      cx={position.x}
      cy={position.y}
      transform-origin={`${position.x} ${position.y}`}
      {...rest}
    />
  )
);

Circle.displayName = "Circle";

export default Circle;
