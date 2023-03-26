import { isDefined } from "./func";

type Validator = (value: string) => string | undefined;

/**
 * Is the string empty, or only whitespace?
 */
const empty: Validator = (value) => {
  if (value.length === 0) {
    return "Cannot be empty";
  }
  if (value.trim().length === 0) {
    return "Cannot contain only whitespace";
  }
  return undefined;
};

function maxLength(length: number): Validator {
  return (value) => (value.length > length ? "Too long" : undefined);
}

/**
 * Is the string only alphanumeric characters or spaces? Also disallow
 * consecutive spaces or leading/trailing spaces.
 */
const simple: Validator = (value) => {
  if (!/^[a-zA-Z0-9 ]+$/.test(value)) {
    return "Can only contain letters, numbers, and spaces";
  }
  if (value !== value.trim()) {
    return "Cannot contain leading or trailing spaces";
  }
  if (/ {2}/.test(value)) {
    return "Cannot contain consecutive spaces";
  }
  return undefined;
};

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
  return empty(value) ?? maxLength(100)(value);
}

/**
 * Validate usernames
 */
export function validateUsername(value: string): string | undefined {
  return empty(value) ?? maxLength(25)(value) ?? simple(value);
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
