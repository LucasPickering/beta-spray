/**
 * @module
 * Styles for various components in the editor SVG. These are just common styles,
 * component-specific styles live in those components.
 *
 * This also holds some constants that aren't actually CSS but relate to display.
 */

import { css, SerializedStyles } from "@emotion/react";
import { Theme } from "@mui/material";

export type StyleFunction = (theme: Theme) => SerializedStyles;

/** The distance to shift a disambiguated move from the center of the hold */
export const disambiguationDistance = 5;

/**
 * Apply to elements that are draggable and currently being hovered or dragged
 */
export const styleDraggableHover: StyleFunction = () =>
  css({
    transform: "scale(1.5)",
  });

/**
 * Apply to elements that can be dragged
 */
export const styleDraggable: StyleFunction = (theme) =>
  css({
    cursor: "grab",
    "&:hover": styleDraggableHover(theme),
  });

/**
 * Apply to elements that are actively being dragged
 */
export const styleDragging: StyleFunction = (theme) =>
  css({
    opacity: theme.palette.opacity.translucent,
    cursor: "grabbing",
    pointerEvents: "none",
    "&": styleDraggableHover(theme),
  });

export const styleHighlight: StyleFunction = ({ palette }) =>
  css({
    // Create a glow effect with overlapping shadows
    filter: `drop-shadow(0px 0px 2px ${palette.info.dark})
      drop-shadow(0px 0px 2px ${palette.info.dark})
      drop-shadow(0px 0px 4px ${palette.info.dark})`,
  });

/**
 * Apply to elements that can be dropped onto and are being hovered
 */
export const styleDropHover: StyleFunction = ({ palette }) =>
  css({
    stroke: palette.info.light,
    fill: palette.info.light,
    fillOpacity: 1,
  });
