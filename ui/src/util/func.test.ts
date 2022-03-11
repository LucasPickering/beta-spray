import { moveArrayElement } from "./func";

describe("moveArrayElement", () => {
  const array = ["a", "b", "c", "d", "e"];

  test("move element down list", () => {
    expect(moveArrayElement(array, 1, 3)).toEqual(["a", "c", "d", "b", "e"]);
  });

  test("move element up list", () => {
    expect(moveArrayElement(array, 3, 1)).toEqual(["a", "d", "b", "c", "e"]);
  });

  test("move up from first slot", () => {
    expect(moveArrayElement(array, 0, 2)).toEqual(["b", "c", "a", "d", "e"]);
  });

  test("move down to last slot", () => {
    expect(moveArrayElement(array, 4, 2)).toEqual(["a", "b", "e", "c", "d"]);
  });
});
