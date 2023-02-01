/**
 * @module
 * Styles for various components in the editor SVG. These are just common styles,
 * component-specific styles live in those components.
 *
 * This also holds some constants that aren't actually CSS but relate to display.
 */

import { css } from "@emotion/react";

/** The distance to shift a disambiguated move from the center of the hold */
export const disambiguationDistance = 5;

/**
 * Apply to elements that are draggable and currently being hovered or dragged
 */
export const styleDraggableHover = css({
  transform: "scale(1.5)",
});

/**
 * Apply to elements that can be dragged
 */
export const styleDraggable = css({
  cursor: "grab",
  "&:hover": styleDraggableHover,
});

/**
 * Apply to elements that are actively being dragged
 */
export const styleDragging = css({
  opacity: 0.6,
  cursor: "grabbing",
  pointerEvents: "none",
  "&": styleDraggableHover,
});

export const styleHighlight = css({
  // Create a glow effect with overlapping shadows
  // TODO use a color from the theme here
  filter: "drop-shadow(0px 0px 2px yellow) drop-shadow(0px 0px 4px yellow)",
});

/**
 * Apply to elements that, upon being clicked, will add some resource
 */
export const styleAddObject = css({
  cursor: "cell",
});

/**
 * Apply to elements that can be dropped onto and are being hovered
 */
export const styleDropHover = css({
  // TODO use a color from the theme here
  stroke: "red",
  fill: "red",
});
