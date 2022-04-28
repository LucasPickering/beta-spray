import { BodyPart as BodyPartApi } from "./BetaEditor/__generated__/BetaEditor_betaNode.graphql";

// TODO break this file apart and move shit to more logical locations

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
 * One move rendered onto the beta overlay.
 */
export interface BetaOverlayMove {
  id: string;
  bodyPart: BodyPart;
  order: number;
  holdId: string;

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
  offset: OverlayPosition | undefined;
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

export function formatOrder(order: number): string {
  return (order + 1).toString();
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
 * Convert a polar coordinate of (radius, angle) to a cartesian one.
 * @param radius Distance from the origin
 * @param radians Offset angle, in *radians*
 */
export function polarToCartesian(
  radius: number,
  radians: number
): OverlayPosition {
  return {
    x: radius * Math.cos(radians),
    y: radius * Math.sin(radians),
  };
}

/**
 * Get the position of a move, including its visual offset (if any)
 */
export function getMoveVisualPosition(move: BetaOverlayMove): OverlayPosition {
  return {
    x: move.position.x + (move.offset?.x ?? 0),
    y: move.position.y + (move.offset?.y ?? 0),
  };
}
