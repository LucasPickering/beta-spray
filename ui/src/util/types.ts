/**
 * A version of Pick that distributes over unions. Useful with discriminated
 * unions.
 * https://davidgomes.com/pick-omit-over-union-types-in-typescript/
 */
export type DistributivePick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;

/**
 * For debuggering
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

/**
 * For debuggering
 */
export type ExpandRecursively<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T;
