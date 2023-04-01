import React from "react";
import Positioned from "./common/Positioned";
import { polarToSvg } from "../util/svg";
import EmbeddedIcon from "components/common/EmbeddedIcon";

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

/**
 * One or more orbs hovering around an SVG item that behave like buttons.
 */
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
          {/* Nested <g> so transform can be independent */}
          <g
            onClick={onClick}
            css={{
              cursor: "pointer",
              "&:hover": { transform: "scale(1.5)" },
            }}
          >
            <circle r={orbRadius} fill={color} />
            {icon && <EmbeddedIcon>{icon}</EmbeddedIcon>}
          </g>
        </Positioned>
      ))}
    </>
  );
};

export default ActionOrbs;
