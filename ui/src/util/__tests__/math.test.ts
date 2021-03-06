import { coerce, lerpColor } from "../math";

describe("coerce", () => {
  test("value in range", () => {
    expect(coerce(2, 1, 3)).toEqual(2);
  });

  test("value below range", () => {
    expect(coerce(0.5, 1, 3)).toEqual(1);
  });

  test("value above range", () => {
    expect(coerce(3.1, 1, 3)).toEqual(3);
  });
});

describe("lerpColor", () => {
  test("white/black", () => {
    expect(lerpColor(0x000000, 0xffffff, 0.0)).toEqual(0x000000);
    expect(lerpColor(0x000000, 0xffffff, 0.5)).toEqual(0x7f7f7f);
    expect(lerpColor(0x000000, 0xffffff, 1.0)).toEqual(0xffffff);
  });
});
