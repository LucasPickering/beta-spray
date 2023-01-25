import { useCallback, useContext } from "react";
import { XYCoord } from "react-dnd";
import { BetaContext, SvgContext } from "./context";
import { assertIsDefined, groupBy, isDefined } from "../../../util/func";
import { hexToHtml, htmlToHex, lerpColor } from "../../../util/math";
import type { BodyPart as BodyPartAPI } from "../EditorSvg/BetaEditor/__generated__/BetaEditor_betaNode.graphql";
import theme from "../../../util/theme";
import { disambiguationDistance } from "styles/svg";

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
 * Get the color pair representing each beta move. The primary color will be a
 * linear interpolation between two colors based on the ordering of the move
 * within the beta. The secondary color expresses further metadata.
 *
 * @param move All moves in the beta (from Relay)
 * @returns Map of beta ID : color pair, to be passed to BetaContext
 */
export function getBetaMoveColors(
  moves: Array<{ id: string; order: number; isStart: boolean }>
): Map<string, string> {
  const startColor = htmlToHex(theme.palette.primary.main);
  const endColor = htmlToHex(theme.palette.secondary.main);
  const colorMap: Map<string, string> = new Map();

  // Generate a color for each move
  for (const move of moves) {
    const hex = lerpColor(
      startColor,
      endColor,
      // Make sure we map first=>0, last=>1
      (move.order - 1) / (moves.length - 1)
    );
    colorMap.set(move.id, hexToHtml(hex));
  }

  return colorMap;
}

/**
 * Body parts sorted counter-clockwise, which follows the unit circle
 */
const bodyPartsCCW: BodyPart[] = [
  "RIGHT_HAND",
  "LEFT_HAND",
  "LEFT_FOOT",
  "RIGHT_FOOT",
];

/**
 * Get the visual position for each move in a beta. For each move, this will
 * calculate some visual offset from its true position in order to make the beta
 * more legible. Specifically, this spreads apart moves on the same hold so they
 * can all be seen at once. These positions should be used for any rendering
 * purposes (so basically everywhere in the UI).
 *
 * @param moves All moves in the beta (from Relay). Readonly because mutating
 *  Relay state is a nono.
 * @returns Map of beta ID : visual position, to be passed to BetaContext
 */
export function getBetaMoveVisualPositions(
  moves: ReadonlyArray<{
    readonly id: string;
    readonly bodyPart: BodyPart;
    readonly hold: { id: string; position: OverlayPosition } | null;
    readonly position: OverlayPosition | null;
  }>
): Map<string, OverlayPosition> {
  const positionMap: Map<string, OverlayPosition> = new Map();

  // Start by just jamming every move into the map
  for (const move of moves) {
    // Grab position from either the hold (for attached moves) or the move
    // itself (for free moves)
    const position = move.position ?? move.hold?.position;
    if (position) {
      positionMap.set(move.id, position);
    } else {
      // eslint-disable-next-line no-console
      console.warn("No position available for move:", move);
    }
  }

  // Next, we'll apply offsets to moves that share the same hold+body part, so
  // they don't sit on top of each other. The steps are:
  // 1. By body part, so left hand is top-left, right foot is bottom-right, etc.
  // 2. Spread evenly within that 90° slice (if multiple moves per body part)
  // So iterate over each move and set its visual offset accordingly

  const sliceSize = Math.PI / 2; // 90 degrees

  // Group by hold, then body part
  for (const movesByHold of groupBy(
    // Exclude free moves, since they'll never share the *exact* some position
    // Maybe we'll need a more dynamic disambiguation, but not yet
    moves.filter((move) => isDefined(move.hold)),
    (move) => move.hold?.id
  ).values()) {
    const movesByBodyPart = groupBy(movesByHold, (move) => move.bodyPart);

    bodyPartsCCW.forEach((bodyPart, i) => {
      const bodyPartMoves = movesByBodyPart.get(bodyPart);
      if (isDefined(bodyPartMoves)) {
        // The angle of the *start* of the slice
        const bodyPartAngle = sliceSize * i;

        // Break the slice into n+1 subslices, where n is number of moves on this
        // hold *for this body part*. We do +1 because we want them evenly spaced
        // between beginning and end, e.g. 1 move => 1/2 mark, 2 moves => 1/3 marks
        const subsliceSize = sliceSize / (bodyPartMoves.length + 1);

        // API wil pre-sort by order, and that ordering will persist here
        bodyPartMoves.forEach((move, i) => {
          // If the move is attached to a hold, we want to apply spreading
          const offset = polarToSvg(
            disambiguationDistance,
            // i+1 so we don't start at the extreme edge
            bodyPartAngle + subsliceSize * (i + 1)
          );

          // Apply the offset to create the visual position
          const position = positionMap.get(move.id);
          // The map is fully populated above so this assertion is safe
          assertIsDefined(position);
          positionMap.set(move.id, add(position, offset));
        });
      }
    });
  }

  return positionMap;
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

/**
 * A hook for accessing the color of each move in the beta. This returns a
 * getter than can then provide each move's color, so that you can easily
 * handle multiple moves within one component. Relies on BetaContext being
 * present and the colors being initialized within that context.
 *
 * @returns A function that takes in a move ID and returns its color
 */
export function useBetaMoveColor(): (betaMoveId: string) => string {
  const { betaMoveColors } = useContext(BetaContext);
  return useCallback(
    (betaMoveId) => {
      const color = betaMoveColors.get(betaMoveId);
      if (!isDefined(color)) {
        // TODO figure out why this gets triggered in BetaDetails after deletion
        // eslint-disable-next-line no-console
        console.warn(
          `No color for beta move ${betaMoveId}. Either the ID is unknown or` +
            ` color was't initialized in this part of the component tree.`
        );
        return "#000000";
      }
      return color;
    },
    [betaMoveColors]
  );
}

/**
 * A hook for accessing the visual position of each move in the beta. This
 * returns a getter than can then provide each move's position, so that you can
 * easily handle multiple moves within one component. Relies on BetaContext
 * being present and the visual positions being initialized within that context.
 *
 * @returns A function that takes in a move ID and returns its position
 */
export function useBetaMoveVisualPosition(): (
  betaMoveId: string
) => OverlayPosition {
  const { betaMoveVisualPositions } = useContext(BetaContext);
  return useCallback(
    (betaMoveId) => {
      const visualPosition = betaMoveVisualPositions.get(betaMoveId);
      if (!isDefined(visualPosition)) {
        throw new Error(
          `No visual position for beta move ${betaMoveId}. Either the ID is unknown or` +
            ` positions weren't initialized in this part of the component tree.`
        );
      }
      return visualPosition;
    },
    [betaMoveVisualPositions]
  );
}