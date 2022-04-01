import { Box, Button, Stack } from "@mui/material";
import React, { useContext } from "react";
import { Edit as IconEdit, Done as IconDone } from "@mui/icons-material";
import EditorContext from "context/EditorContext";

/**
 * Static container for editor controls. For large screens.
 */
const EditorPanel: React.FC = ({ children }) => {
  const { editingHolds, setEditingHolds } = useContext(EditorContext);

  return (
    <Box sx={({ spacing }) => ({ padding: spacing(2) })}>
      <Stack direction="column" spacing={2}>
        <Button
          startIcon={editingHolds ? <IconDone /> : <IconEdit />}
          color={editingHolds ? "success" : "primary"}
          variant={editingHolds ? "contained" : "outlined"}
          onClick={() => setEditingHolds((old) => !old)}
          sx={{ width: "100%" }}
        >
          {editingHolds ? "Done" : "Edit Holds"}
        </Button>

        {children}
      </Stack>
    </Box>
  );
};

export default EditorPanel;
