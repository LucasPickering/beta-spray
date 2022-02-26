/**
 * Assert the given value is defined. Useful as a type guard when you know
 * something is defined but the typechecker doesn't.
 */
export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new Error(`Expected value to be defined, but was ${value}`);
  }
}
