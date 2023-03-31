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

const iconSizeForeign = 24; // Size of the foreign icon object (usually SVGIcon)
const iconSizeLocal = 4; // Size we want the icon to render as

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
            {icon && (
              // We assume the icon is a SvgIcon from material UI, which has a
              // known size. We'll scale the object down from that known size
              // to a size that want, to fit into the circle
              <foreignObject
                width={iconSizeForeign}
                height={iconSizeForeign}
                x={-iconSizeForeign / 2}
                y={-iconSizeForeign / 2}
                transform={`scale(${iconSizeLocal / iconSizeForeign})`}
              >
                {icon}
              </foreignObject>
            )}
          </g>
        </Positioned>
      ))}
    </>
  );
};

export default ActionOrbs;
