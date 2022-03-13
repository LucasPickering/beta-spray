import {
  Box,
  Drawer,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu as IconMenu } from "@mui/icons-material";
import React, { useState } from "react";

/**
 * Wrapper for the sidebar next to the editor. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed
 */
const EditorSidebar: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { breakpoints, spacing } = useTheme();
  const isPermanent = useMediaQuery(breakpoints.up("md"));

  return (
    <>
      {!isPermanent && (
        <IconButton
          aria-label="Open drawer"
          onClick={() => setIsOpen(true)}
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
          }}
        >
          <IconMenu />
        </IconButton>
      )}
      <Drawer
        anchor="right"
        variant={isPermanent ? "permanent" : "temporary"}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: 250,
          },
        }}
      >
        <Box sx={{ padding: spacing(2) }}>
          <Stack direction="column" spacing={2}>
            {children}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default EditorSidebar;
