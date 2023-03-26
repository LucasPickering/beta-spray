const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

/**
 * Format a date into a friendly longform string, e.g. "March 23, 2023".
 * @param date The date as an ISO string, which is the format we get from Relay
 * @returns Formatted date
 */
export function formatDate(date: string): string {
  return dateFormat.format(new Date(date));
}
