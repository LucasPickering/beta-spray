import React from "react";
import {
  styleAddObject,
  styleDraggable,
  styleDragging,
  styleDropHover,
  styleHoldIcon,
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
        styleHoldIcon,
        // TODO figure out how to move this into styles/, need to access MUI
        // theme from the emotion `css` function
        draggable
          ? { fill: palette.primary.main, stroke: "white" }
          : { fill: "white", stroke: palette.primary.main },
        clickable && styleAddObject,
        draggable && styleDraggable,
        isDragging && styleDragging,
        isOver && styleDropHover,
      ]}
    />
  );
};

export default HoldIcon;
