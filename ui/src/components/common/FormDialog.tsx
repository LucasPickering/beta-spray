import { Clear as IconClear, Save as IconSave } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { MutationState } from "util/useMutation";
import MutationErrorSnackbar from "./MutationErrorSnackbar";

interface Props {
  title: string;
  open: boolean;
  hasChanges?: boolean;
  hasError?: boolean;
  mutationState?: MutationState;
  errorMessage?: string;
  onSave?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
}

/**
 * A dialog (AKA modal) containing a form that edits a single object. This will
 * provide the surrounding dialog, as well as Cancel/Save buttons.
 *
 * This is meant to be used with useForm, so some of the props can be passed
 * directly from there. Optionally, you can also pass in a mutation state to
 * get loading and error states. If an error message is given, we'll also render
 * an error snackbar.
 */
const FormDialog: React.FC<Props> = ({
  title,
  open,
  hasChanges,
  hasError,
  mutationState,
  errorMessage,
  onSave,
  onClose,
  children,
}) => (
  <>
    <Dialog open={open} maxWidth="xs" fullWidth onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave?.();
        }}
      >
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          <Stack spacing={2}>{children}</Stack>
        </DialogContent>

        <DialogActions>
          <Button
            startIcon={<IconClear />}
            onClick={() => {
              if (
                !hasChanges ||
                window.confirm("Are you sure? You have unsaved changes.")
              ) {
                onClose?.();
              }
            }}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={<IconSave />}
            variant="contained"
            type="submit"
            loading={mutationState?.status === "loading"}
            disabled={!hasChanges || hasError}
          >
            Save
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>

    {mutationState && errorMessage && (
      <MutationErrorSnackbar message={errorMessage} state={mutationState} />
    )}
  </>
);

export default FormDialog;
