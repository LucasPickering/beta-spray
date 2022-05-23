import { Box, Drawer, IconButton, Stack } from "@mui/material";
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
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <>
      {/* Top-right overlay buttons */}
      <Box sx={{ position: "absolute", top: 4, right: 4 }}>
        {/* Add an additional button to switch editor modes, because opening
            the drawer is annoying */}
        <ModeButton iconOnly />
        <IconButton aria-label="Open drawer" onClick={() => setIsOpen(true)}>
          <IconMenu />
        </IconButton>
      </Box>

      <Drawer anchor="right" open={isOpen} onClose={() => setIsOpen(false)}>
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
