export const supportedProtocols = ["http:", "https:"];
export const supportedExternalHosts = ["mountainproject.com"];

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

/**
 * Validate a link to an external page. This checks:
 * - The link is a valid URL
 * - The protocol is HTTP or HTTPS
 * - The hostname is an approved site (to prevent malicious links)
 * - The length isn't too long
 */
export function validateExternalLink(value: string): string | undefined {
  // Empty strings are valid
  if (value.length == 0) {
    return undefined;
  }

  try {
    const url = new URL(value);
    if (!supportedProtocols.includes(url.protocol)) {
      return "Unsupported URL protocol";
    }
    if (!supportedExternalHosts.includes(url.host)) {
      return "Unsupported external website";
    }
    if (value.length > 100) {
      return "Too long";
    }

    return undefined;
  } catch (e) {
    return "Invalid URL";
  }
}
