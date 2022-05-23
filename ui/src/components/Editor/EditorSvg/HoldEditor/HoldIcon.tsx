import React from "react";
import { css } from "@emotion/react";
import {
  styleAddObject,
  styleDraggable,
  styleDragging,
  styleDropHover,
} from "styles/dnd";
import { useTheme } from "@mui/material";

interface Props {
  clickable?: boolean;
  draggable?: boolean;
  isDragging?: boolean;
  isOver?: boolean;
}

const styleHoldMark = css({
  r: 4,
  opacity: 0.5,
  fill: "white",
  stroke: "white",
  strokeWidth: 0.3,
});

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
        styleHoldMark,
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
