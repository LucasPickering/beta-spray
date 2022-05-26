/**
 * @module
 * Styles for various components in the editor SVG. This holds both
 * single-component and shared styles. Hopefully centralizing all presentation
 * values makes it easier to tweak stuff.
 *
 * This also holds some constants that aren't actually CSS but relate to display.
 */

import { css } from "@emotion/react";

/**
 * Length of the hash mark on starting moves, including the portion hidden by
 * the move itself.
 */
export const startHashLength = 4.5;

/** The distance to shift a disambiguated move from the center of the hold */
export const disambiguationDistance = 3.8;

/**
 * Base styles for a hold.
 */
export const styleHoldIcon = css({
  r: 4,
  opacity: 0.5,
  strokeWidth: 0.5,
});

/**
 * Apply to elements that are draggable and currently highlighted (usually because they're hovered)
 */
export const styleDraggableHighlight = css({
  transform: "scale(1.5)",
});

/**
 * Apply to elements that can be dragged
 */
export const styleDraggable = css({
  cursor: "grab",
  "&:hover": styleDraggableHighlight,
});

/**
 * Apply to elements that are actively being dragged
 */
export const styleDragging = css({
  opacity: 0.6,
  cursor: "grabbing",
  pointerEvents: "none",
  "&": styleDraggableHighlight,
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
  stroke: "red",
  fill: "red",
});
