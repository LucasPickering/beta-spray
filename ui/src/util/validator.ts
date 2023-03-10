import { isDefined } from "./func";

/**
 * These sites are approved targets for external links. Everything else is
 * blocked, for security reasons.
 */
export const supportedExternalHosts = [
  {
    // Need to match sure we match with and without www.
    hostnamePattern: /^(.*\.)?mountainproject\.com$/,
    label: "Mountain Project",
  },
];

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
 * Validate usernames
 */
export function validateUsername(value: string): string | undefined {
  // TODO
  return value.length <= 20 ? undefined : "bad!";
}

/**
 * Get the text label for an external link, based on its hostname.
 * @param url A possibly-valid external URL
 * @returns A user-friendly label for the link, e.g. "Mountain Project" for a
 *  mountainproject.com link. Returns undefined iff the URL is invalid
 */
export function getExternalLinkLabel(url: URL): string | undefined {
  return supportedExternalHosts.find(({ hostnamePattern: pattern }) =>
    pattern.test(url.host)
  )?.label;
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
    if (!/^https?:$/.test(url.protocol)) {
      return "Unsupported URL protocol";
    }
    if (!isDefined(getExternalLinkLabel(url))) {
      return "Unsupported external website";
    }
    if (value.length > 1000) {
      return "Too long";
    }

    return undefined;
  } catch (e) {
    return "Invalid URL";
  }
}
