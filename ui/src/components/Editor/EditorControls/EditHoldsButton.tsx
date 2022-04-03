import { Button } from "@mui/material";
import React, { useContext } from "react";
import { Edit as IconEdit, Done as IconDone } from "@mui/icons-material";
import EditorContext from "context/EditorContext";

interface Props {
  onEdit?: () => void;
  onDone?: () => void;
}

/**
 * A button to toggle Edit Holds mode
 */
const EditHoldsButton: React.FC<Props> = ({ onEdit, onDone }) => {
  const { editingHolds, setEditingHolds } = useContext(EditorContext);

  return editingHolds ? (
    <Button
      startIcon={<IconDone />}
      color="success"
      variant="contained"
      onClick={() => {
        setEditingHolds(false);
        if (onDone) {
          onDone();
        }
      }}
    >
      Done
    </Button>
  ) : (
    <Button
      startIcon={<IconEdit />}
      color="primary"
      variant="outlined"
      onClick={() => {
        setEditingHolds(true);
        if (onEdit) {
          onEdit();
        }
      }}
    >
      Edit Holds
    </Button>
  );
};

export default EditHoldsButton;
