import { Breakpoint, useTheme } from "@mui/material";

/**
 * Generate a string for the `sizes` prop of an Image based on a mapping of MUI
 * breakpoints to sizes.
 *
 * @param breakpoints A mapping of MUI breakpoints to the intended size when >=
 *  that breakpoint. There should be in *descending* order of breakpoint size!
 *  e.g. lg, md, sm
 * @param defaultSize Default size, when viewpoint width is below the lowest threshold given
 * @return A `sizes` string
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attr-sizes
 */
export function useImageSizes(
  breakpointSizes: Partial<Record<Breakpoint, string>>,
  defaultSize: string = "100vw"
): string {
  const { breakpoints } = useTheme();
  const sizes = [
    // Note: this relies on consistent object order, and that the user passed
    // the keys in descending order
    ...Object.entries(breakpointSizes).map(([breakpoint, size]) => {
      // MUI spits out media *queries*, but we want *conditions*, which lack the
      // @media tag, so we need to remove that now
      const mediaQuery = breakpoints.up(breakpoint as Breakpoint);
      const mediaCondition = mediaQuery.replace(/^@media /, "");
      return `${mediaCondition} ${size}`;
    }),
    defaultSize,
  ];
  return sizes.join(",");
}
