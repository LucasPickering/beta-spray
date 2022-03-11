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
 * Slide an element up or down an array, *returning a new array*
 */
export function moveArrayElement<T>(
  array: T[],
  oldIndex: number,
  newIndex: number
): T[] {
  if (oldIndex < newIndex) {
    // Move *down* the list (to a higher index)
    return [
      // Everything before the old index
      ...array.slice(0, oldIndex),
      // Everything between old and new index
      ...array.slice(oldIndex + 1, newIndex + 1),
      // New position
      array[oldIndex],
      // Everything after the new index
      ...array.slice(newIndex + 1),
    ];
  } else {
    // Move *up* the list (to a lower index)
    return [
      // Everything before the new index
      ...array.slice(0, newIndex),
      // New position
      array[oldIndex],
      // Everything between new and old index
      ...array.slice(newIndex, oldIndex),
      // Everything after old index
      ...array.slice(oldIndex + 1),
    ];
  }
}
