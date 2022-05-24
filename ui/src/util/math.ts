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
  const valueCoerced = coerce(value, 0, 1); // Prevent shenanigans
  const coefficient1 = 1 - valueCoerced;
  const coefficient2 = valueCoerced;

  // For each of RGB: mask down that component from each color, do a weighted
  // average, then add that back into the result
  const mixed = [16, 8, 0].reduce((acc, bits) => {
    const component1 = (color1 >> bits) & 0xff;
    const component2 = (color2 >> bits) & 0xff;
    const mixedComponent =
      component1 * coefficient1 + component2 * coefficient2;
    return acc | (mixedComponent << bits);
  }, 0);

  return mixed;
}
