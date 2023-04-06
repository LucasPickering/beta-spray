import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { isDefined } from "util/func";

interface Props {
  title?: string;
  annotation?: string;
  open?: boolean;
  onClose?: () => void;
  onSave?: (newValue: string) => void;
}

/**
 * Dialog to edit the annotation on a hold or beta move.
 */
const EditAnnotationDialog: React.FC<Props> = ({
  annotation,
  title,
  open = false,
  onSave,
  onClose,
}) => {
  // Local state, will be propagated on submission
  const [editedAnnotation, setEditedAnnotation] = useState<string>(
    annotation ?? ""
  );
  const saveChanges = (): void => {
    // Trigger save action if the contents changed
    if (onSave && annotation !== editedAnnotation) {
      onSave(editedAnnotation);
    }
    if (onClose) {
      onClose();
    }
  };

  // If the external value changes, update our local state
  useEffect(() => {
    if (isDefined(annotation)) {
      setEditedAnnotation(annotation);
    }
  }, [annotation]);

  // Opened by the Edit button. Always save on exit.
  return (
    <Dialog open={open} onClose={saveChanges}>
      <DialogTitle>{title}</DialogTitle>

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
  );
};

export default EditAnnotationDialog;
