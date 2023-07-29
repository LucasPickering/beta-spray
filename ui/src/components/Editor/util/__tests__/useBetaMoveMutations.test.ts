import { createBetaMoveLocal, reorderBetaMoveLocal } from "../moves";

const moves = {
  edges: [
    { node: { id: "move1", order: 1, isStart: true } },
    { node: { id: "move2", order: 2, isStart: true } },
    { node: { id: "move3", order: 3, isStart: false } },
  ],
} as const;

// isStart is intentionally fucked on all these tests, it's not worth
// calcuating on the UI right now

describe("createBetaMoveLocal", () => {
  test("insert move into empty beta", () => {
    expect(createBetaMoveLocal({ edges: [] }, "newMove", 1)).toEqual({
      edges: [{ node: { id: "newMove", order: 1, isStart: false } }],
    });
  });

  test("insert move to start of beta", () => {
    expect(createBetaMoveLocal(moves, "newMove", 1)).toEqual({
      edges: [
        { node: { id: "newMove", order: 1, isStart: false } },
        { node: { id: "move1", order: 2, isStart: true } },
        { node: { id: "move2", order: 3, isStart: true } },
        { node: { id: "move3", order: 4, isStart: false } },
      ],
    });
  });

  test("insert move to middle of beta", () => {
    expect(createBetaMoveLocal(moves, "newMove", 2)).toEqual({
      edges: [
        { node: { id: "move1", order: 1, isStart: true } },
        { node: { id: "newMove", order: 2, isStart: false } },
        { node: { id: "move2", order: 3, isStart: true } },
        { node: { id: "move3", order: 4, isStart: false } },
      ],
    });
  });

  test("insert move to end of beta", () => {
    expect(createBetaMoveLocal(moves, "newMove", 4)).toEqual({
      edges: [
        { node: { id: "move1", order: 1, isStart: true } },
        { node: { id: "move2", order: 2, isStart: true } },
        { node: { id: "move3", order: 3, isStart: false } },
        { node: { id: "newMove", order: 4, isStart: false } },
      ],
    });
  });

  test("insert move to start of beta if order too low", () => {
    // 0 gets rounded up to 1
    expect(createBetaMoveLocal(moves, "newMove", 0)).toEqual({
      edges: [
        { node: { id: "newMove", order: 1, isStart: false } },
        { node: { id: "move1", order: 2, isStart: true } },
        { node: { id: "move2", order: 3, isStart: true } },
        { node: { id: "move3", order: 4, isStart: false } },
      ],
    });
  });

  test("insert move to end of beta if order is too high", () => {
    // 5 gets rounded down to 4
    expect(createBetaMoveLocal(moves, "newMove", 5)).toEqual({
      edges: [
        { node: { id: "move1", order: 1, isStart: true } },
        { node: { id: "move2", order: 2, isStart: true } },
        { node: { id: "move3", order: 3, isStart: false } },
        { node: { id: "newMove", order: 4, isStart: false } },
      ],
    });
  });
});

describe("reorderBetaMoveLocal", () => {
  test("do nothing for same order", () => {
    expect(reorderBetaMoveLocal(moves, "move1", 1)).toEqual(moves);
  });

  test("reorder first", () => {
    expect(reorderBetaMoveLocal(moves, "move1", 3)).toEqual({
      edges: [
        { node: { id: "move2", order: 1, isStart: true } },
        { node: { id: "move3", order: 2, isStart: false } },
        { node: { id: "move1", order: 3, isStart: true } },
      ],
    });
  });

  test("reorder middle->up", () => {
    expect(reorderBetaMoveLocal(moves, "move2", 3)).toEqual({
      edges: [
        { node: { id: "move1", order: 1, isStart: true } },
        { node: { id: "move3", order: 2, isStart: false } },
        { node: { id: "move2", order: 3, isStart: true } },
      ],
    });
  });

  test("reorder middle->down", () => {
    expect(reorderBetaMoveLocal(moves, "move2", 1)).toEqual({
      edges: [
        { node: { id: "move2", order: 1, isStart: true } },
        { node: { id: "move1", order: 2, isStart: true } },
        { node: { id: "move3", order: 3, isStart: false } },
      ],
    });
  });

  test("reorder last", () => {
    expect(reorderBetaMoveLocal(moves, "move3", 1)).toEqual({
      edges: [
        { node: { id: "move3", order: 1, isStart: false } },
        { node: { id: "move1", order: 2, isStart: true } },
        { node: { id: "move2", order: 3, isStart: true } },
      ],
    });
  });

  test("reorder to first if order is too low", () => {
    // 0 gets rounded up to 1
    expect(reorderBetaMoveLocal(moves, "move2", 0)).toEqual({
      edges: [
        { node: { id: "move2", order: 1, isStart: true } },
        { node: { id: "move1", order: 2, isStart: true } },
        { node: { id: "move3", order: 3, isStart: false } },
      ],
    });
  });

  test("reorder to last if order is too high", () => {
    // 4 gets rounded down to 3
    expect(reorderBetaMoveLocal(moves, "move2", 4)).toEqual({
      edges: [
        { node: { id: "move1", order: 1, isStart: true } },
        { node: { id: "move3", order: 2, isStart: false } },
        { node: { id: "move2", order: 3, isStart: true } },
      ],
    });
  });

  test("handle missing move", () => {
    expect(reorderBetaMoveLocal(moves, "unknown", 1)).toEqual(moves);
  });
});
