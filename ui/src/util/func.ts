/**
 * Do nothing
 */
export function noop(): void {
  // noop!
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
 * Slide an element up or down an array, *returning a new array*
 */
export function moveArrayElement<T>(
  array: readonly T[],
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

/**
 * Map the values of an object, returning a new object
 * @param obj Object to map
 * @param mapper Function that maps a single value
 * @returns An object of equal length as the input, with each value mapped
 */
export function mapValues<K extends string, V1, V2>(
  obj: Record<K, V1>,
  mapper: (value: V1, key: K) => V2
): Record<K, V2> {
  return Object.entries<V1>(obj).reduce((acc, [key, value]) => {
    // Object.entries is shitty and wipes out key type, so we have to add it back
    acc[key as K] = mapper(value, key as K);
    return acc;
    // Technically this assertion isn't true until the loop is done iterating
  }, {} as Record<K, V2>);
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
 * Convert a unary sort key function into a binary comparator.
 *
 * Warning: the key function will be called once per element *per comparison*,
 * meaning O(n log n) times per sort.
 *
 * @param keyFunc A mapping function, that gets a sortable numeric value for an array element
 * @returns A two-element comparator function, to be given to `Array.sort`
 */
export function comparator<T>(
  keyFunc: (value: T) => number
): (a: T, b: T) => number {
  return (a, b) => keyFunc(a) - keyFunc(b);
}

/**
 * Find a node in a connection, by ID
 * @param connection Relay connection
 * @param id ID of the node to find
 * @returns The node with the given ID, or undefined if not in the connection
 */
export function findNode<T extends { readonly id: string }>(
  connection: { readonly edges: ReadonlyArray<{ readonly node: T }> },
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
export function findNodeIndex<T extends { readonly id: string }>(
  connection: { readonly edges: ReadonlyArray<{ readonly node: T }> },
  id: string
): number {
  return connection.edges.findIndex(({ node }) => node.id === id);
}
