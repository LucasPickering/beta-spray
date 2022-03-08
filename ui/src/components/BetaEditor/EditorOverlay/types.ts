import { BodyPart as BodyPartApi } from "components/BetaEditor/__generated__/BetaDetails_betaNode.graphql";

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
 * An alias for the BodyPart enum from the API. Makes imports a bit simpler.
 */
export type BodyPart = BodyPartApi;
