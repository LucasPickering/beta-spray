const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });
const bytesFormat = new Intl.NumberFormat(undefined, {
  style: "unit",
  unit: "byte",
  unitDisplay: "narrow",
  notation: "compact",
});

/**
 * Format a date into a friendly longform string, e.g. "March 23, 2023".
 * @param date The date as an ISO string, which is the format we get from Relay
 * @returns Formatted date
 */
export function formatDate(date: string): string {
  return dateFormat.format(new Date(date));
}

/**
 * Foramt the size of a file into a string of B, KB, etc.
 * @param file File object
 * @returns File size, as a number+unit
 */
export function formatFileSize(file: Blob): string {
  return bytesFormat.format(file.size);
}
