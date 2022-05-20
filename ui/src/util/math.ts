/**
 * Force a value into a range
 * */
export function coerce(
  value: number,
  minimum: number,
  maximum: number
): number {
  if (value < minimum) {
    return minimum;
  }
  if (value > maximum) {
    return maximum;
  }
  return value;
}

/**
 * Convert a hex code to an RGB tuple
 * @param hex 24-bit hex code
 * @returns RGB tuple
 */
export function hexToRgb(hex: number): [number, number, number] {
  return [16, 8, 0].map((bits) => (hex >> bits) & 0xff) as [
    number,
    number,
    number
  ];
}

/**
 * Convert an RGB tuple to a hex code
 * @param rgb RGB tuple
 * @returns 24-bit hex code
 */
export function rgbToHex(rgb: [number, number, number]): number {
  return [16, 8, 0].reduce((acc, bits, i) => acc | (rgb[i] << bits), 0);
}

/**
 * Convert an HTML color string to a hex code. HTML string must be a simple hex
 * code, no English names (e.g. "white")
 * @param html HTML color string, e.g. #ff0000
 * @returns 24-bit hex code
 */
export function htmlToHex(html: string): number {
  return parseInt(html.substring(1), 16);
}

/**
 * Linearly interpolate between two colors
 * @param color1 Starting color
 * @param color2 Ending color
 * @param value Linear value between 0 (start color) and 1 (end color)
 * @returns A color somewhere between start and end
 */
export function lerpColor(
  color1: number,
  color2: number,
  value: number
): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const valueCoerced = coerce(value, 0, 1);
  const coefficient1 = 1 - valueCoerced;
  const coefficient2 = valueCoerced;
  const averaged = rgb1.map((component1, i) => {
    const component2 = rgb2[i];
    return component1 * coefficient1 + component2 * coefficient2;
  }) as [number, number, number];
  return rgbToHex(averaged);
}
