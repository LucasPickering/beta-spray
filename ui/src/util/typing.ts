/**
 * Generally useful types.
 *
 * Warning! If you rename this to types.ts, imports will break! I think TS then
 * tries to import types from the `util` package.
 */

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

/**
 * A Relay node type
 */
export type Node = { readonly id: string };
/**
 * A Relay connection type
 */
export type Connection<N extends Node> = {
  readonly edges: ReadonlyArray<{ readonly node: N }>;
};
