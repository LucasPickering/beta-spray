export {};

declare global {
  interface Array<T> {
    // TODO remove after es2023 upgrade https://github.com/microsoft/TypeScript/issues/48829
    findLast(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: unknown
    ): T | undefined;
    findLastIndex(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: unknown
    ): number;
  }
  interface ReadonlyArray<T> {
    // TODO remove after es2023 upgrade https://github.com/microsoft/TypeScript/issues/48829
    findLast(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: unknown
    ): T | undefined;
    findLastIndex(
      predicate: (value: T, index: number, array: T[]) => unknown,
      thisArg?: unknown
    ): number;
  }
}
