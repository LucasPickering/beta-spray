import { Connection, Node } from "./typing";

/**
 * Do nothing
 */
export function noop(): void {
  // noop!
}

/**
 * Print a value and return it
 * @param value Value to print and return
 * @param message Information prefix for the debug message
 * @returns Passed value
 */
export function debug<T>(value: T, message: string = "debug:"): T {
  // eslint-disable-next-line no-console
  console.log(message, value);
  return value;
}

/**
 * Check if a value is not null/undefined
 */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Assert the given value is defined. Useful as a type guard when you know
 * something is defined but the typechecker doesn't.
 */
export function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (!isDefined(value)) {
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
 * Coerce a value into a numeric range.
 * @param value Value to coerce
 * @param min Minimum acceptable value (inclusive)
 * @param max Maximum acceptable value (inclusive)
 * @returns Coerced value, or NaN if any input is NaN
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

/**
 * Get the last element in an array. This may seem pointless, but the typing
 * is more realistic, since Typescript pretends that array indices are
 * guaranteed to be valid.
 * @param array Array to index
 * @returns Last element in the array, or undefined if the array is empty
 */
export function last<T>(array: ReadonlyArray<T>): T | undefined {
  return array[array.length - 1];
}

/**
 * Get an array of a range of numbers
 * @param start First number in the range (inclusive)
 * @param stop First number *not* in the range (i.e. exclusive bound)
 * @returns Array of [start, ..., stop - 1]
 */
export function range(start: number, stop: number): number[] {
  return Array(stop - start)
    .fill(0)
    .map((e, i) => start + i);
}

/**
 * Slide an element up or down an array, *mutating the array*
 */
export function moveArrayElement<T>(
  array: T[],
  oldIndex: number,
  newIndex: number
): void {
  const [value] = array.splice(oldIndex, 1);
  array.splice(newIndex, 0, value);
}

/**
 * Map the values of an object, returning a new object. The objects can
 * optionally have disparate value types, as long as the mapper function is
 * compliant with the input/output signatures.
 * @template O1 The type of the input object
 * @template O2 The type of the output object (must have the same key type as O1)
 * @param obj Object to map
 * @param mapper Function that maps a single value
 * @returns An object of equal length as the input, with each value mapped
 */
export function mapValues<
  O1 extends Record<string, unknown>,
  O2 extends Record<keyof O1, unknown>
>(obj: O1, mapper: <K extends keyof O1>(value: O1[K], key: K) => O2[K]): O2 {
  type K = keyof O1;
  // We need some type coercion in here, to account for non-uniform value types.
  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Cheeky little type coercion, since Object.entries sucks
    acc[key as K] = mapper(value as O1[K], key as K);
    return acc;
    // Technically this assertion isn't true until the loop is done iterating
  }, {} as O2);
}

/**
 * Group values into a map based on some key on each value.
 *
 * @param values The values to group
 * @param mapper A function that gets a key from each value
 * @returns Values, grouped by key
 */
export function groupBy<T, K>(
  values: T[],
  mapper: (value: T) => K
): Map<K, T[]> {
  return values.reduce<Map<K, T[]>>((acc, value) => {
    const key = mapper(value);

    const group = acc.get(key);
    if (isDefined(group)) {
      group.push(value);
    } else {
      acc.set(key, [value]);
    }

    return acc;
  }, new Map());
}

/**
 * Find a node in a connection, by ID
 * @param connection Relay connection
 * @param id ID of the node to find
 * @returns The node with the given ID, or undefined if not in the connection
 */
export function findNode<T extends Node>(
  connection: Connection<T>,
  id: string
): T | undefined {
  return connection.edges.find(({ node }) => node.id === id)?.node;
}

/**
 * Find the index of a node in a connection, by ID
 * @param connection Relay connection
 * @param id ID of the node to find
 * @returns The index of the node with the given ID, or undefined if not in the
 *  connection, or -1 if not present
 */
export function findNodeIndex<T extends Node>(
  connection: Connection<T>,
  id: string
): number {
  return connection.edges.findIndex(({ node }) => node.id === id);
}
