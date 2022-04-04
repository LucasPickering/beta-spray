import { Stack } from "@mui/material";
import React from "react";
import EditHoldsButton from "./EditHoldsButton";

/**
 * Static container for editor controls. For large screens.
 */
const EditorPanel: React.FC = ({ children }) => (
  <Stack direction="column" spacing={2} padding={2} overflow="auto">
    <EditHoldsButton />

    {children}
  </Stack>
);

export default EditorPanel;
