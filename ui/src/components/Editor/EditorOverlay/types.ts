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
  prev?: BetaOverlayMove;
  next?: BetaOverlayMove;
  bodyPart: BodyPart;
  order: number;
  position: OverlayPosition;
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
