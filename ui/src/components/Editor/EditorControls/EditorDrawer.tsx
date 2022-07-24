import { Box, Paper, Stack } from "@mui/material";
import React from "react";
import ToggleDrawer from "components/common/ToggleDrawer";

interface Props {
  children?: React.ReactNode;
}

/**
 * Drawer container for editor controls. For small screens.
 */
const EditorDrawer: React.FC<Props> = ({ children }) => (
  <Paper sx={{ position: "absolute", top: 0, right: 0, margin: 1 }}>
    <ToggleDrawer
      ButtonProps={{ "aria-label": "Open Controls" }}
      anchor="right"
      // This is maybe a little jank, but we need to make sure BetaList is
      // always mounted, because it has logic to pre-select the first beta
      // on load, which is important.
      keepMounted
      // Make sure not to cover the whole screen
      PaperProps={{ sx: { maxWidth: "80%" } }}
    >
      <Box sx={({ spacing }) => ({ padding: spacing(2) })}>
        <Stack direction="column" spacing={2}>
          {children}
        </Stack>
      </Box>
    </ToggleDrawer>
  </Paper>
);

export default EditorDrawer;
