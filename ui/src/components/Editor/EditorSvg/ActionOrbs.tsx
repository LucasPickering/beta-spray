import React from "react";
import Positioned from "./common/Positioned";
import { polarToSvg } from "../util/svg";

interface Props {
  open: boolean;
  children?: React.ReactNode;
}

const spreadRadius = 6;

/**
 * One or more orbs hovering around an SVG item that behave like buttons.
 */
const ActionOrbs: React.FC<Props> = ({ open, children }) => {
  if (!open) {
    return null;
  }

  const childrenArray = React.Children.toArray(children);
  const sliceSize = (2 * Math.PI) / childrenArray.length;
  return (
    <>
      {childrenArray.map((child, i) => (
        <Positioned key={i} position={polarToSvg(spreadRadius, sliceSize * i)}>
          {child}
        </Positioned>
      ))}
    </>
  );
};

export default ActionOrbs;
