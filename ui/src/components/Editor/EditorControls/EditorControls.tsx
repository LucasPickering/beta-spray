import useIsWide from "util/useIsWide";
import { Box, Stack } from "@mui/material";
import ToggleDrawer from "components/common/ToggleDrawer";
import ErrorBoundary from "components/common/ErrorBoundary";

interface Props {
  children?: React.ReactNode;
}

const permanentDrawerWidth = 280;

/**
 * Wrapper for the controls next to the editor. Dynamically switches between a
 * static and dynmic drawer based on screen size. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed.
 */
const EditorControls: React.FC<Props> = ({ children }) => {
  const isWide = useIsWide(); // Check widescreen vs mobile

  return (
    <ToggleDrawer
      anchor="right"
      {...(isWide
        ? {
            variant: "permanent",
            // Yes, we need to set both of these. The Drawer element is
            // absolutely positioned, so we can't just use width:100% on the
            // Paper child
            sx: { width: permanentDrawerWidth },
            PaperProps: { sx: { width: permanentDrawerWidth } },
          }
        : {
            variant: "temporary",
            ButtonProps: { "aria-label": "Open Controls" },
            // Make sure not to cover the whole screen
            PaperProps: { sx: { maxWidth: "80%" } },
            // This is maybe a little jank, but we need to make sure BetaList
            // is always mounted, because it has logic to pre-select the first
            // beta on load, which is important.
            keepMounted: true,
          })}
    >
      <Box sx={({ spacing }) => ({ padding: spacing(2) })}>
        <Stack direction="column" spacing={2}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Stack>
      </Box>
    </ToggleDrawer>
  );
};
export default EditorControls;
