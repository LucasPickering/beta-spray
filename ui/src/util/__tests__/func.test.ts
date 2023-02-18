import { comparator, moveArrayElement } from "../func";

describe("moveArrayElement", () => {
  let array: string[];

  beforeEach(() => {
    // The method mutates, so we need a new array for each test
    array = ["a", "b", "c", "d", "e"];
  });

  test("no change", () => {
    moveArrayElement(array, 1, 1);
    expect(array).toEqual(["a", "b", "c", "d", "e"]);
  });

  test("move element down list", () => {
    moveArrayElement(array, 1, 3);
    expect(array).toEqual(["a", "c", "d", "b", "e"]);
  });

  test("move element up list", () => {
    moveArrayElement(array, 3, 1);
    expect(array).toEqual(["a", "d", "b", "c", "e"]);
  });

  test("move up from first slot", () => {
    moveArrayElement(array, 0, 2);
    expect(array).toEqual(["b", "c", "a", "d", "e"]);
  });

  test("move down to last slot", () => {
    moveArrayElement(array, 4, 2);
    expect(array).toEqual(["a", "b", "e", "c", "d"]);
  });
});

describe("comparator", () => {
  let array: number[];
  // Sorting will mutate, so we need to re-create this before each test
  beforeEach(() => {
    array = [1, 2, 3, 4, 5];
  });

  test("identity", () => {
    expect(array.sort(comparator((v) => v))).toEqual([1, 2, 3, 4, 5]);
  });

  test("reverse", () => {
    expect(array.sort(comparator((v) => -v))).toEqual([5, 4, 3, 2, 1]);
  });

  test("middle out", () => {
    expect(array.sort(comparator((v) => Math.abs(3 - v)))).toEqual([
      3, 2, 4, 1, 5,
    ]);
  });
});
