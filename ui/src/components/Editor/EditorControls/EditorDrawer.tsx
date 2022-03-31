import { Box, Drawer, IconButton, Stack } from "@mui/material";
import { Menu as IconMenu } from "@mui/icons-material";
import React, { useContext, useState } from "react";
import { Edit as IconEdit, Done as IconDone } from "@mui/icons-material";
import EditorContext from "context/EditorContext";

/**
 * Drawer container for editor controls. For small screens.
 */
const EditorDrawer: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { editingHolds, setEditingHolds } = useContext(EditorContext);

  return (
    <>
      {/* Overlay buttons */}
      <Box sx={{ position: "absolute", top: 4, right: 4 }}>
        <IconButton
          aria-label={editingHolds ? "Done" : "Edit Holds"}
          onClick={() => setEditingHolds((old) => !old)}
        >
          {editingHolds ? <IconDone /> : <IconEdit />}
        </IconButton>
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
