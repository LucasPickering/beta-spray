import React from "react";
import { OverlayPosition } from "util/svg";

interface Props extends React.SVGProps<SVGGElement> {
  position: OverlayPosition;
}

const Positioned = React.forwardRef<SVGGElement, Props>(
  ({ position, children, ...rest }, ref) => (
    <g
      ref={ref}
      transform={`translate(${position.x},${position.y})`}
      transform-origin={`${position.x} ${position.y}`}
      {...rest}
    >
      {children}
    </g>
  )
);

Positioned.displayName = "Positioned";

export default Positioned;
