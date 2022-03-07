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
 * Assert that a given value is of a particular data kind. This is asserts that
 * a value is of a particular variant of a discriminated union. The discriminant
 * must use the field name `kind` for this.
 */
export function assertDataKind<T extends { kind: string }, K extends T["kind"]>(
  d: T,
  kind: K
): asserts d is Extract<T, { kind: K }> {
  if (d.kind !== kind) {
    throw new Error(`Expected data to be of kind ${kind}, but got: ${d.kind}`);
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
