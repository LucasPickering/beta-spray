import { css } from "@emotion/react";

export const styleDraggable = css({
  cursor: "grab",
});

export const styleDragging = css({
  opacity: 0.5,
  cursor: "grabbing",
});

export const styleDropHover = css({
  opacity: 0.5,
  color: "red",
});
