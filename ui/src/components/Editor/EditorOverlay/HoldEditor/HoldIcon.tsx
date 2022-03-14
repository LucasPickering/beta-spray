import React from "react";
import { IconTriangle } from "components/icons";
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
  <IconTriangle
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
