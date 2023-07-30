import EmbeddedIcon from "components/common/EmbeddedIcon";
import React, { useRef } from "react";
import { Tooltip } from "@mui/material";
import SvgTooltip from "./SvgTooltip";

interface Props {
  color?: string;
  title?: string;
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
const ActionOrb: React.FC<Props> = ({
  color = "#ffffff",
  title,
  onClick,
  children,
}) => {
  const ref = useRef<SVGGElement>(null);
  return (
    <Tooltip title={title} open={Boolean(title)}>
      <g
        ref={ref}
        onClick={onClick}
        css={{
          cursor: "pointer",
          "&:hover": { transform: "scale(1.5)" },
        }}
      >
        <circle r={orbRadius} fill={color} />
        {/* Assume children is an SvgIcon */}
        <EmbeddedIcon
          css={({ palette }) => ({ color: palette.getContrastText(color) })}
        >
          {children}
        </EmbeddedIcon>
      </g>
    </Tooltip>
  );
};

export default ActionOrb;
