/**
 * The default validator. Disallows empty and egregiously long strings.
 */
export function validateString(value: string): string | undefined {
  // Disallow empty strings OR whitespace-only strings
  if (value.trim().length === 0) {
    return "Cannot be empty";
  }
  if (value.length > 100) {
    return "Too long";
  }
  return undefined;
}
