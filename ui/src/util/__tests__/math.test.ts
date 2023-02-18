import { coerce, hexToHtml, htmlToHex, lerpColor } from "../math";

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

describe("htmlToHex", () => {
  test("valid values", () => {
    expect(htmlToHex("#000000")).toEqual(0x000000);
    expect(htmlToHex("#ff0000")).toEqual(0xff0000);
    expect(htmlToHex("#00ff00")).toEqual(0x00ff00);
    expect(htmlToHex("#0000ff")).toEqual(0x0000ff);
    expect(htmlToHex("#ffffff")).toEqual(0xffffff);
    expect(htmlToHex("#ab375f")).toEqual(0xab375f);
  });

  test("invalid values", () => {
    expect(htmlToHex("yellow")).toEqual(NaN);
    expect(htmlToHex("w000000")).toEqual(NaN);
    expect(htmlToHex("000000")).toEqual(NaN);
    expect(htmlToHex("#000")).toEqual(NaN);
    expect(htmlToHex("#0000000")).toEqual(NaN);
    expect(htmlToHex("🦃")).toEqual(NaN);
  });
});

describe("hexToHtml", () => {
  test("valid values", () => {
    expect(hexToHtml(0x000000)).toEqual("#000000");
    expect(hexToHtml(0xff0000)).toEqual("#ff0000");
    expect(hexToHtml(0x00ff00)).toEqual("#00ff00");
    expect(hexToHtml(0x0000ff)).toEqual("#0000ff");
    expect(hexToHtml(0xffffff)).toEqual("#ffffff");
    expect(hexToHtml(0xab375f)).toEqual("#ab375f");
  });

  test("invalid values", () => {
    expect(hexToHtml(-1)).toEqual("");
    expect(hexToHtml(0xffffff0)).toEqual("");
  });
});

describe("lerpColor", () => {
  test("one color", () => {
    expect(lerpColor(0xff0000, 0xff0000, 0.0)).toEqual(0xff0000);
    expect(lerpColor(0xff0000, 0xff0000, 0.3)).toEqual(0xff0000);
    expect(lerpColor(0xff0000, 0xff0000, 1.0)).toEqual(0xff0000);
    expect(lerpColor(0xff0000, 0xff0000, NaN)).toEqual(0x000000);
  });

  test("two colors", () => {
    expect(lerpColor(0xff0000, 0xffffff, 0.0)).toEqual(0xff0000);
    expect(lerpColor(0xff0000, 0xffffff, 0.5)).toEqual(0xff7f7f);
    expect(lerpColor(0xff0000, 0xffffff, 1.0)).toEqual(0xffffff);
    expect(lerpColor(0xff0000, 0xffffff, NaN)).toEqual(0x000000);
  });
});
