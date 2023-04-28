import { clamp, moveArrayElement } from "../func";

describe("clamp", () => {
  test("in range", () => {
    expect(clamp(0, 0, 5)).toEqual(0);
    expect(clamp(3, 0, 5)).toEqual(3);
    expect(clamp(5, 0, 5)).toEqual(5);
  });

  test("too low", () => {
    expect(clamp(-1, 0, 5)).toEqual(0);
  });

  test("too high", () => {
    expect(clamp(6, 0, 5)).toEqual(5);
  });

  test("wonky range", () => {
    // Empty range
    expect(clamp(3, 0, 0)).toEqual(0);
    // Backward range
    expect(clamp(3, 0, -1)).toEqual(0);
  });

  test("NaN", () => {
    expect(clamp(NaN, 0, 5)).toEqual(NaN);
    expect(clamp(3, NaN, 5)).toEqual(NaN);
    expect(clamp(3, 0, NaN)).toEqual(NaN);
  });
});

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
