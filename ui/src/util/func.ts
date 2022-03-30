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
 * Get a random integer in [min, max)
 * @param min Min value, inclusive
 * @param max MAx value, exclusive
 * @returns Random integer in [min, max)
 */
export function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * max);
}

/**
 * Pick a random element from a set
 * @param elements Elements to pick from
 * @returns Randomly selected element from set
 */
export function randomElement<T>(elements: T[]): T {
  if (elements.length === 0) {
    throw new Error(`Cannot sample from empty set`);
  }

  return elements[randomInt(0, elements.length)];
}

/**
 * Generate a phrase by picking one element from each phrase group and joining
 * them together.
 * @param phraseGroups A list of phrase groups. Each group is a collection of
 * elements that *could* go in that phrase position. One element is selected
 * from each group, in the given order. To make a group optional, include an
 * `undefined` element (or multiple, for weighted odds).
 * @param exclude Complete phrases to avoid, e.g. if generating a name that must
 * be unique
 * @param retryLimit Limit on the number of retries when generating a unique
 * name. If a pre-existing name is generated, we'll try again. This prevents
 * infinite loops when the phrase pool is exhausted.
 * @returns The generated phrase
 */
export function randomPhrase(
  phraseGroups: (string | undefined)[][],
  exclude?: string[],
  retryLimit: number = 5
): string {
  for (let i = 0; i < retryLimit; i++) {
    const phrase = phraseGroups.map(randomElement).filter(Boolean).join(" ");
    if (exclude && !exclude.includes(phrase)) {
      return phrase;
    }
  }

  throw new Error(
    `No unique string generated in ${retryLimit} tries. Excluded: ${exclude}`
  );
}
