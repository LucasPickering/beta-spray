import {
  APIPosition,
  OverlayPosition,
} from "components/BetaEditor/EditorOverlay/types";

/**
 * Assert the given value is defined. Useful as a type guard when you know
 * something is defined but the typechecker doesn't.
 */
export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to be defined, but was ${value}`);
  }
}

/**
 * Convert an API position (the format that we get from the API) to a position
 * renderable within an SVG.
 */
export function toOverlayPosition(
  apiPosition: APIPosition,
  aspectRatio: number
): OverlayPosition {
  return {
    x: apiPosition.positionX * 100,
    y: (apiPosition.positionY * 100) / aspectRatio,
  };
}
