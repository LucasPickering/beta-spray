import useIsWide from "util/useIsWide";
import { Paper, Box, Stack } from "@mui/material";
import ToggleDrawer from "components/common/ToggleDrawer";

interface Props {
  children?: React.ReactNode;
}

/**
 * Wrapper for the controls next to the editor. Dynamically switches between a
 * static and dynmic drawer based on screen size. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed.
 */
const EditorControls: React.FC<Props> = ({ children }) => {
  const isWide = useIsWide(); // Check widescreen vs mobile

  return (
    <Paper sx={{ position: "absolute", top: 0, right: 0, margin: 1 }}>
      <ToggleDrawer
        anchor="right"
        {...(isWide
          ? { variant: "permanent", PaperProps: { sx: { width: 280 } } }
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
            {children}
          </Stack>
        </Box>
      </ToggleDrawer>
    </Paper>
  );
};
export default EditorControls;
