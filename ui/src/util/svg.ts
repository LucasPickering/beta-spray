import { useCallback, useContext } from "react";
import { XYCoord } from "react-dnd";
import { SvgContext } from "./context";
import { assertIsDefined } from "./func";
import { BodyPart as BodyPartApi } from "../components/Editor/EditorSvg/BetaEditor/__generated__/BetaEditor_betaNode.graphql";
import { hexToHtml, htmlToHex, lerpColor } from "./math";
import theme from "./theme";

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
 * An element with an on-image position, as defined by the API. Both x and y
 * are [0,1]
 */
export interface APIPosition {
  positionX: number;
  positionY: number;
}

/**
 * All supported body parts. Defined as an enum so we can iterate over it.
 */
export enum BodyPart {
  LEFT_HAND = "LEFT_HAND",
  RIGHT_HAND = "RIGHT_HAND",
  LEFT_FOOT = "LEFT_FOOT",
  RIGHT_FOOT = "RIGHT_FOOT",
}

/**
 * A pair of colors, used to pass around color data for a beta move.
 */
export interface ColorPair {
  fill: string;
  /**
   * Stroke denotes additional metadata, not all moves get a stroke.
   */
  stroke: string | undefined;
}

/**
 * One move rendered onto the beta overlay.
 */
export interface BetaOverlayMove {
  // This stuff comes directly from the API (see GQL docs for descriptions)
  id: string;
  bodyPart: BodyPart;
  order: number;
  isStart: boolean;
  holdId: string;
  // Everything below is generated by the UI

  /**
   * Visual position of the move. *Warning:* You should generally use {@link getMovePosition}
   * instead of accessing this directly, so offset can be applied appropriately.
   */
  position: OverlayPosition;

  /**
   * If defined, this represents a *visual-only* offset of the move. This should
   * be used to translate the move whenever it's rendered. Used for
   * disambiguation.
   */
  offset: OverlayPosition;

  /**
   * We pre-compute color because we need the full list of moves present to do
   * so, which isn't feasible to pass around everywhere.
   */
  color: ColorPair;
}

/**
 * Convert a body part value from the API type to the local type
 */
export function toBodyPart(bodyPart: BodyPartApi): BodyPart {
  if (bodyPart === "%future added value") {
    throw new Error(`Unknown body part: ${bodyPart}`);
  }

  return BodyPart[bodyPart];
}

export function formatBodyPart(bodyPart: BodyPart): string {
  switch (bodyPart) {
    case BodyPart.LEFT_HAND:
      return "Left Hand";
    case BodyPart.RIGHT_HAND:
      return "Right Hand";
    case BodyPart.LEFT_FOOT:
      return "Left Foot";
    case BodyPart.RIGHT_FOOT:
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
 * Get the position of a move, including its visual offset (if any)
 */
export function getMoveVisualPosition(move: BetaOverlayMove): OverlayPosition {
  return {
    x: move.position.x + move.offset.x,
    y: move.position.y + move.offset.y,
  };
}

/**
 * Get the fill+outline color representing a beta move. The fill color will be a
 * linear interpolation between two colors based on the ordering of the move
 * within the beta. The outline color expresses further metadata.
 *
 * @param order Order of the move in question
 * @param isStart Is this a starting move?
 * @param totalMoves Total number of moves in the beta
 * @returns Main and outline color. Outline color may be empty.
 */
export function getMoveColor(
  order: number,
  isStart: boolean,
  totalMoves: number
): ColorPair {
  const startColor = 0xffffff;
  const endColor = htmlToHex(theme.palette.primary.main);
  const hex = lerpColor(startColor, endColor, order / totalMoves);
  const fill = hexToHtml(hex);

  const stroke = isStart ? theme.palette.secondary.main : undefined;

  return { fill, stroke };
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
