import EmbeddedIcon from "components/common/EmbeddedIcon";
import React from "react";

interface Props {
  color?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export const orbRadius = 3.5; // Exported for AddBetaMoveMark

/**
 * A button-like orb in SVG land.
 * @param color Orb color
 * @param onClick onclick callback
 * @param children Children to render inside the orb. **Assumed to be an SvgIcon**
 */
const ActionOrb: React.FC<Props> = ({ color, onClick, children }) => (
  <g
    onClick={onClick}
    css={{
      cursor: "pointer",
      "&:hover": { transform: "scale(1.5)" },
    }}
  >
    <circle r={orbRadius} fill={color} />
    {/* Assume children is an SvgIcon */}
    <EmbeddedIcon>{children}</EmbeddedIcon>
  </g>
);

export default ActionOrb;
