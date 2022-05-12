import { Box, Drawer, IconButton, Stack } from "@mui/material";
import { Menu as IconMenu } from "@mui/icons-material";
import React, { useContext, useState } from "react";
import { Done as IconDone } from "@mui/icons-material";
import { EditorContext } from "util/context";
import EditHoldsButton from "./EditHoldsButton";

interface Props {
  children?: React.ReactNode;
}

/**
 * Drawer container for editor controls. For small screens.
 */
const EditorDrawer: React.FC<Props> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { editingHolds, setEditingHolds } = useContext(EditorContext);

  return (
    <>
      {/* Overlay buttons */}
      <Box sx={{ position: "absolute", top: 4, right: 4 }}>
        {/* Add an additional "done editing" button in the overlay for mobile */}
        {editingHolds && (
          <IconButton
            aria-label="Done Editing Holds"
            onClick={() => setEditingHolds(false)}
          >
            <IconDone />
          </IconButton>
        )}
        <IconButton aria-label="Open drawer" onClick={() => setIsOpen(true)}>
          <IconMenu />
        </IconButton>
      </Box>

      <Drawer anchor="right" open={isOpen} onClose={() => setIsOpen(false)}>
        <Box sx={({ spacing }) => ({ padding: spacing(2) })}>
          <Stack direction="column" spacing={2}>
            <EditHoldsButton onEdit={() => setIsOpen(false)} />

            {children}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default EditorDrawer;
