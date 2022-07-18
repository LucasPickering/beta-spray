import React from "react";
import {
  styleAddObject,
  styleDraggable,
  styleDragging,
  styleDropHover,
} from "styles/svg";
import { useTheme } from "@mui/material";

interface Props {
  clickable?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
}

/**
 * Dumb component for rendering a hold
 */
const HoldIcon: React.FC<Props> = ({
  clickable = false,
  draggable = false,
  isDragging = false,
  isOver = false,
}) => {
  const { palette } = useTheme();
  return (
    <circle
      css={[
        {
          r: 7,
          opacity: 0.6,
          strokeWidth: 0.5,
          fill: "white",
          stroke: palette.primary.main,
        },
        clickable && styleAddObject,
        draggable && styleDraggable,
        isDragging && styleDragging,
        isOver && styleDropHover,
      ]}
    />
  );
};

export default HoldIcon;
