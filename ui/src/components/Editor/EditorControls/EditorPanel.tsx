import { Box, Stack } from "@mui/material";
import React from "react";
import EditHoldsButton from "./EditHoldsButton";

/**
 * Static container for editor controls. For large screens.
 */
const EditorPanel: React.FC = ({ children }) => (
  <Box sx={({ spacing }) => ({ padding: spacing(2) })}>
    <Stack direction="column" spacing={2}>
      <EditHoldsButton />

      {children}
    </Stack>
  </Box>
);

export default EditorPanel;
