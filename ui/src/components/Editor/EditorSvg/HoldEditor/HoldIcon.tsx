import React from "react";
import { css } from "@emotion/react";
import {
  styleAddObject,
  styleDraggable,
  styleDragging,
  styleDropHover,
} from "styles/dnd";

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
}) => (
  <circle
    css={[
      styleHoldMark,
      clickable && styleAddObject,
      draggable && styleDraggable,
      isDragging && styleDragging,
      isOver && styleDropHover,
    ]}
  />
);

export default HoldIcon;
