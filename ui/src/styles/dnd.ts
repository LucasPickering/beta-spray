import { css } from "@emotion/react";

// Apply to elements that are draggable and currently highlighted (usually because they're hovered)
export const styleDraggableHighlight = css({
  transform: "scale(1.5)",
});

// Apply to elements that can be dragged
export const styleDraggable = css({
  cursor: "grab",
  "&:hover": styleDraggableHighlight,
});

// Apply to elements that are actively being dragged
export const styleDragging = css({
  opacity: 0.6,
  cursor: "grabbing",
});

// Apply to elements that, upon being clicked, will add some resource
export const styleAddObject = css({
  cursor: "cell",
});

// Apply to elements that can be dropped onto and are being hovered
export const styleDropHover = css({
  stroke: "red",
  fill: "red",
});
