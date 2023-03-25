import { Delete as IconDelete, Edit as IconEdit } from "@mui/icons-material";
import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import TooltipIconButton from "components/common/TooltipIconButton";
import { useEffect, useState } from "react";
import { isDefined } from "util/func";

interface Props {
  noun?: string;
  annotation?: string;
  disabled?: boolean;
  permissions?: {
    canEdit: boolean;
    canDelete: boolean;
  };
  editingAnnotation?: boolean;
  onEditAnnotation?: () => void;
  onCloseAnnotation?: () => void;
  onSaveAnnotation?: (newValue: string) => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}

/**
 * A generic component for rendering buttons for highlight actions. This is
 * type-agnostic, meaning it can be used for holds, moves, etc. The state for
 * the annotation modal has to be managed externally so that it can be closed
 * automatically when the mutations are done (so onClose has to be callable
 * externally).
 */
const ActionButtons: React.FC<Props> = ({
  noun,
  annotation,
  disabled = false,
  editingAnnotation = false,
  permissions,
  onEditAnnotation,
  onSaveAnnotation,
  onCloseAnnotation,
  onDelete,
}) => {
  // Local state, will be propagated on field blur
  const [editedAnnotation, setEditedAnnotation] = useState<string>(
    annotation ?? ""
  );
  const saveChanges = (): void => {
    // Trigger save action if the contents changed
    if (onSaveAnnotation && annotation !== editedAnnotation) {
      onSaveAnnotation(editedAnnotation);
    }
    if (onCloseAnnotation) {
      onCloseAnnotation();
    }
  };

  // If the external value changes, update our local state
  useEffect(() => {
    if (isDefined(annotation)) {
      setEditedAnnotation(annotation);
    }
  }, [annotation]);

  return (
    <>
      <TooltipIconButton
        title={noun ? `Edit notes for ${noun}` : "Select item to edit"}
        disabledTitle={
          permissions?.canEdit === false &&
          `You don't have permission to edit this ${noun}`
        }
        color="info"
        disabled={disabled || permissions?.canEdit === false}
        onClick={onEditAnnotation}
      >
        <IconEdit />
      </TooltipIconButton>

      <TooltipIconButton
        title={noun ? `Delete ${noun}` : "Select item to delete"}
        disabledTitle={
          permissions?.canDelete === false &&
          `You don't have permission to delete this ${noun}`
        }
        color="info"
        disabled={disabled || permissions?.canDelete === false}
        onClick={onDelete}
      >
        <IconDelete />
      </TooltipIconButton>

      {/* Opened by the Edit button. Always save on exit. */}
      <Dialog open={editingAnnotation} onClose={saveChanges}>
        <DialogTitle>{noun ? `Edit Notes for ${noun}` : ""}</DialogTitle>

        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveChanges();
            }}
          >
            <TextField
              autoFocus // Doesn't work in dev https://github.com/mui/material-ui/issues/33004
              label="Notes"
              value={editedAnnotation}
              onChange={(e) => setEditedAnnotation(e.target.value)}
              sx={{
                width: "100%",
                marginTop: 1, // Prevents cutting off label on top
              }}
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionButtons;
