import { FormEvent, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import { isDefined } from "util/func";

interface Props {
  open: boolean;
  title: string;
  initialValue?: string;
  onSave?: (newValue: string) => void;
  onClose?: () => void;
}

/**
 * Generic dialog for editing annotation on a hold/move.
 */
const EditAnnotationDialog: React.FC<Props> = ({
  open,
  title,
  initialValue,
  onSave,
  onClose,
}) => {
  // Local state, will be propagated on field blur
  const [annotation, setAnnotation] = useState<string>(initialValue ?? "");
  const saveChanges = (): void => {
    // Trigger save action if the contents changed
    if (onSave && annotation !== initialValue) {
      onSave(annotation);
    }
  };

  // If the external value changes, update our local state
  useEffect(() => {
    if (isDefined(initialValue)) {
      setAnnotation(initialValue);
    }
  }, [initialValue]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            saveChanges();
          }}
        >
          <TextField
            autoFocus // Doesn't work in dev https://github.com/mui/material-ui/issues/33004
            label="Notes"
            value={annotation}
            onChange={(e) => setAnnotation(e.target.value)}
            onBlur={saveChanges}
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
