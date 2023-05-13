import { assertIsDefined } from "util/func";
import { useCallback, useContext } from "react";
import { XYCoord } from "react-dnd";
import type { BodyPart as BodyPartAPI } from "../EditorSvg/BetaEditor/__generated__/BetaEditor_betaNode.graphql";
import { SvgContext } from "./context";

/**
 * 2D dimension of a rectangle
 */
export interface Dimensions {
  width: number;
  height: number;
}

/**
 * The position of an object in the rendered overlay. Values are [0,100] for X
 * and [0,height] in Y, where `height` is 100/aspectRatio.
 */
export interface OverlayPosition {
  x: number;
  y: number;
}

/**
 * Re-export of the BodyPart type from GraphQL, for convenience. We need
 * separate import and export statements though, so we can also refer to the
 * type within this file.
 */
export type BodyPart = BodyPartAPI;

/**
 * Climber's body position at a particular point in the beta. Each body part is
 * at a particular position, which is represented by a move ID.
 */
export type Stance = Record<BodyPart, string>;

/**
 * Body parts, order top-left to bottom-right
 */
export const allBodyParts: BodyPart[] = [
  "LEFT_HAND",
  "RIGHT_HAND",
  "LEFT_FOOT",
  "RIGHT_FOOT",
];

/**
 * Format a body part key as a user-friendly string.
 */
export function formatBodyPart(bodyPart: BodyPart): string {
  switch (bodyPart) {
    case "LEFT_HAND":
      return "Left Hand";
    case "RIGHT_HAND":
      return "Right Hand";
    case "LEFT_FOOT":
      return "Left Foot";
    case "RIGHT_FOOT":
      return "Right Foot";
  }
}

/**
 * Add two positions
 */
export function add(
  position1: OverlayPosition,
  position2: OverlayPosition
): OverlayPosition {
  return { x: position1.x + position2.x, y: position1.y + position2.y };
}

/**
 * Subtract the second position from the first
 */
export function subtract(
  position1: OverlayPosition,
  position2: OverlayPosition
): OverlayPosition {
  return { x: position1.x - position2.x, y: position1.y - position2.y };
}

/**
 * Multiply the position by a scalar factory
 */
export function multiply(
  position: OverlayPosition,
  factor: number
): OverlayPosition {
  return { x: position.x * factor, y: position.y * factor };
}

/**
 * Get the magnitude of a position/vector
 */
export function magnitude(position: OverlayPosition): number {
  return Math.sqrt(Math.pow(position.x, 2) + Math.pow(position.y, 2));
}

/**
 * Scale a position/vector so its magnitude is 1, with the same direction
 */
export function unit(position: OverlayPosition): OverlayPosition {
  return multiply(position, 1 / magnitude(position));
}

/**
 * Calculate Euclidean distance between two points
 */
export function distanceTo(
  position1: OverlayPosition,
  position2: OverlayPosition
): number {
  return Math.sqrt(
    Math.pow(position2.x - position1.x, 2) +
      Math.pow(position2.y - position1.y, 2)
  );
}

/**
 * Get the midpoint of two positions
 */
export function midpoint(
  position1: OverlayPosition,
  position2: OverlayPosition
): OverlayPosition {
  return {
    x: (position1.x + position2.x) / 2,
    y: (position1.y + position2.y) / 2,
  };
}

/**
 * Convert a polar point of (radius, angle) to an SVG point. Note: SVG
 * coordinates are *not* cartesian! SVG uses the top-left as origin, with right
 * being +x and down being +y.
 *
 * @param radius Distance from the origin, in SVG coordinates (top-left is origin)
 * @param radians Offset angle, in *radians*, following the unit circle
 */
export function polarToSvg(radius: number, radians: number): OverlayPosition {
  return {
    x: radius * Math.cos(radians),
    y: radius * -Math.sin(radians),
  };
}

/**
 * Hook that returns a function to convert DOM positions to SVG positions. DOM
 * positions are returned from DOM events, and we often need to convert those
 * to SVG coordinates. This will handle both the scaling and translation needed
 * to do that conversion.
 *
 * @param domPosition DOM position, in pixels, starting at the top-left *of the screen*
 * @returns SVG position, in SVG units, starting at the top-left *of the SVG*
 */
export function useDOMToSVGPosition(): (
  domPosition: XYCoord
) => OverlayPosition {
  const { svgRef } = useContext(SvgContext);
  return useCallback(
    (domPosition) => {
      // Map DOM coords to SVG
      // https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
      const svg = svgRef.current;
      assertIsDefined(svg); // Ref is only null on first render

      const point = svg.createSVGPoint();
      point.x = domPosition.x;
      point.y = domPosition.y;

      const ctm = svg.getScreenCTM();
      assertIsDefined(ctm);
      const result = point.matrixTransform(ctm.inverse());
      // Make sure we map the SVGPoint instance to a plain object
      // Otherwise, it can't be freely passed as a Relay arg
      return { x: result.x, y: result.y };
    },
    [svgRef]
  );
}
