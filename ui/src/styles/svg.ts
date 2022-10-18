/**
 * @module
 * Styles for various components in the editor SVG. These are just common styles,
 * component-specific styles live in those components.
 *
 * This also holds some constants that aren't actually CSS but relate to display.
 */

import { css } from "@emotion/react";

/** The distance to shift a disambiguated move from the center of the hold */
export const disambiguationDistance = 6;

/**
 * Apply to elements that are draggable and currently highlighted (usually because they're hovered)
 */
export const styleDraggableHighlight = css({
  // We can't scale lines because that fucks up their length, so we need to
  // just adjust stroke width for them instead.
  "&:not(line)": {
    transform: "scale(1.5)",
  },

  // This is really dumb, but I can't figure out how else to select only `line`
  // elements
  "&:not(:not(line))": {
    // This is a bit hacky to hard-code the stroke width, but we only have one
    // line type right now so it's fine
    strokeWidth: 2.5,
  },
});

/**
 * Apply to elements that are visually faded/de-emphasized
 */
export const styleFaded = css({
  opacity: 0.5,
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
