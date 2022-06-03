import { Box, Drawer, IconButton, Paper, Stack } from "@mui/material";
import { Menu as IconMenu } from "@mui/icons-material";
import React, { useState } from "react";
import ModeButton from "./ModeButton";

interface Props {
  children?: React.ReactNode;
}

/**
 * Drawer container for editor controls. For small screens.
 */
const EditorDrawer: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Top-right overlay buttons */}
      <Paper sx={{ position: "absolute", top: 0, right: 0, margin: 1 }}>
        {/* Add an additional button to switch editor modes, because opening
            the drawer is annoying */}
        <ModeButton iconOnly />
        <IconButton aria-label="Open drawer" onClick={() => setIsOpen(true)}>
          <IconMenu />
        </IconButton>
      </Paper>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        // Make sure not to cover the whole screen
        PaperProps={{ sx: { maxWidth: "80%" } }}
      >
        <Box sx={({ spacing }) => ({ padding: spacing(2) })}>
          <Stack direction="column" spacing={2}>
            {children}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default EditorDrawer;
