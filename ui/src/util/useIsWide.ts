import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Is the user on a wide screen? Typically this means they're on desktop (as
 * opposed to phone), but not necessarily. Important, this is *not* a reliable
 * check to see if the user is on touch vs mouse.
 */
function useIsWide(): boolean {
  const { breakpoints } = useTheme();
  return useMediaQuery(breakpoints.up("md"));
}

export default useIsWide;
