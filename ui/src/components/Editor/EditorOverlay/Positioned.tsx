import React from "react";
import { OverlayPosition } from "./types";

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

export default Positioned;
