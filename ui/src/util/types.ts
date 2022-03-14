/**
 * A version of Pick that distributes over unions. Useful with discriminated
 * unions.
 * https://davidgomes.com/pick-omit-over-union-types-in-typescript/
 */
export type DistributivePick<T, K extends keyof T> = T extends unknown
  ? Pick<T, K>
  : never;
