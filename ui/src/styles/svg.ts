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

  // I can't figure out the correct incantation to make this rule only apply to
  // `line` elements, but fortunately it doesn't seem to impact any other
  // elements so we can apply to all.
  // TODO make this only apply to lines so it doesn't affect holds
  strokeWidth: 2.5,
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
