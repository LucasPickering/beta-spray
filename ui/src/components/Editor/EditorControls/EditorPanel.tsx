import { Stack } from "@mui/material";
import React from "react";

interface Props {
  children?: React.ReactNode;
}

/**
 * Static container for editor controls. For large screens.
 */
const EditorPanel: React.FC<Props> = ({ children }) => (
  <Stack
    direction="column"
    spacing={2}
    padding={2}
    overflow="auto"
    flexShrink={0}
    width={280}
  >
    {children}
  </Stack>
);

export default EditorPanel;
