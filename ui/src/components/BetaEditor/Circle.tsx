import React from "react";
import { D3Position, DragType } from "util/d3";

interface Props {
  className?: string;
  position: D3Position;
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
