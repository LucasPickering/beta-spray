import React from "react";
import { polarToSvg } from "components/Editor/util/svg";
import Positioned from "./Positioned";

interface Props {
  open: boolean;
  children?: React.ReactNode;
}

/**
 * One or more orbs hovering around an SVG item that behave like buttons.
 */
const ActionOrbs: React.FC<Props> = ({ open, children }) => {
  if (!open) {
    return null;
  }

  const childrenArray = React.Children.toArray(children);
  const spreadRadius = getSpreadRadius(childrenArray.length);
  const initialAngle = Math.PI / 2; // Start at the top
  const sliceSize = (2 * Math.PI) / childrenArray.length;
  return (
    <>
      {childrenArray.map((child, i) => (
        <Positioned
          key={i}
          position={polarToSvg(spreadRadius, initialAngle + sliceSize * i)}
        >
          {child}
        </Positioned>
      ))}
    </>
  );
};

/**
 * More orbs = more spread
 */
function getSpreadRadius(numOrbs: number): number {
  return Math.max(numOrbs * 1.5, 6);
}

export default ActionOrbs;
