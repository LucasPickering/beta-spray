import React from "react";
import { OverlayPosition } from "./types";
import Positioned from "./Positioned";
import styled from "@emotion/styled";

interface Props extends React.SVGProps<SVGCircleElement> {
  className?: string;
  position: OverlayPosition;
  innerLabel?: string;
  outerLabel?: string;
}

const Text = styled.text`
  font-size: 3px;
  user-select: none;
  pointer-events: none;
`;

const Circle = React.forwardRef<SVGCircleElement, Props>(
  ({ className, position, innerLabel, outerLabel, ...rest }, ref) => (
    <Positioned position={position}>
      <circle ref={ref} className={className} r={2} {...rest} />

      {innerLabel && (
        <Text textAnchor="middle" dominantBaseline="middle">
          {innerLabel}
        </Text>
      )}

      {outerLabel && (
        <Text x={2} y={2}>
          {outerLabel}
        </Text>
      )}
    </Positioned>
  )
);

Circle.displayName = "Circle";

export default Circle;
