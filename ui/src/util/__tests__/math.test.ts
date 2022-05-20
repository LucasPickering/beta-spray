import { coerce, hexToRgb, rgbToHex } from "../math";

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

describe("hexToRgb", () => {
  test("mixed color", () => {
    expect(hexToRgb(0xfe9865)).toEqual([0xfe, 0x98, 0x65]);
  });
});

describe("rgbToHex", () => {
  test("mixed color", () => {
    expect(rgbToHex([0xfe, 0x98, 0x65])).toEqual(0xfe9865);
  });
});
