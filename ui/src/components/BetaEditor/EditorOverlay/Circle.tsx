import React from "react";
import { OverlayPosition, DragType } from "./types";

interface Props {
  className?: string;
  position: OverlayPosition;
  dragType?: DragType;
}

const Circle: React.FC<Props> = React.forwardRef<SVGCircleElement, Props>(
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

Circle.defaultProps = {} as Partial<Props>;
Circle.displayName = "Circle";

export default Circle;
