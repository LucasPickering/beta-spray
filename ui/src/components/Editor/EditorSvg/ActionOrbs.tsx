import React from "react";
import Positioned from "./common/Positioned";
import { polarToSvg } from "../util/svg";

interface Props {
  open: boolean;
  actions: Array<{
    id: string;
    icon?: React.ReactElement;
    color?: string;
    onClick?: () => void;
  }>;
}

const orbRadius = 3;
const spreadRadius = 6;

const ActionOrbs: React.FC<Props> = ({ open, actions }) => {
  if (!open) {
    return null;
  }

  // TODO improve styling
  const sliceSize = (2 * Math.PI) / actions.length;
  return (
    <>
      {actions.map(({ id, icon, color, onClick }, i) => (
        <Positioned key={id} position={polarToSvg(spreadRadius, sliceSize * i)}>
          <circle r={orbRadius} fill={color} onClick={onClick} />
          {icon}
        </Positioned>
      ))}
    </>
  );
};

export default ActionOrbs;
