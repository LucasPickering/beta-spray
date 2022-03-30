import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Menu as IconMenu } from "@mui/icons-material";
import React, { useContext, useState } from "react";
import { Edit as IconEdit, Done as IconDone } from "@mui/icons-material";
import EditorContext from "context/EditorContext";

/**
 * Wrapper for the sidebar next to the editor. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed
 */
const EditorSidebar: React.FC = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const { breakpoints } = useTheme();
  const isPermanent = useMediaQuery(breakpoints.up("md"));
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
        {!isPermanent && (
          <IconButton aria-label="Open drawer" onClick={() => setIsOpen(true)}>
            <IconMenu />
          </IconButton>
        )}
      </Box>

      <Drawer
        anchor="right"
        variant={isPermanent ? "permanent" : "temporary"}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
          },
        }}
      >
        <Box sx={({ spacing }) => ({ padding: spacing(2) })}>
          <Stack direction="column" spacing={2}>
            {isPermanent && (
              <Button
                startIcon={editingHolds ? <IconDone /> : <IconEdit />}
                color={editingHolds ? "success" : "primary"}
                variant="outlined"
                onClick={() => setEditingHolds((old) => !old)}
                sx={{ width: "100%" }}
              >
                {editingHolds ? "Done" : "Edit"}
              </Button>
            )}

            {children}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

export default EditorSidebar;
