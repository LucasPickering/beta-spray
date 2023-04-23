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
import { useCallback, useEffect } from "react";
import { FormState } from "util/useForm";
import { isDefined } from "util/func";
import usePreviousValue from "util/usePreviousValue";

interface Props {
  title: string;
  open: boolean;
  formState: FormState<unknown>;
  closeOnSuccess?: boolean;
  mutationState: MutationState;
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
  closeOnSuccess = true,
  formState,
  mutationState,
  errorMessage,
  onSave,
  onClose: onCloseProp,
  children,
}) => {
  const onClose = useCallback(() => {
    onCloseProp?.();
    // Reset mutation state. Otherwise, we'll immediately close
    // the modal next time because of a lingering success state
    // (with closeOnSuccess enabled)
    mutationState?.reset?.();
    // Note - you might want to add formState.onReset() here, but
    // it's unnecessary since we automatically reset it on open
    // with a useEffect above
  }, [mutationState, onCloseProp]);

  // Automatically close the form when the mutation succeeds
  const mutationStatus = mutationState?.status;
  useEffect(() => {
    if (open && closeOnSuccess && mutationStatus === "success") {
      // Warning: if this is getting triggered immediately on open, make sure
      // your onClose handler is calling resetState for the mutation!
      onClose();
    }
  }, [open, closeOnSuccess, mutationStatus, onClose]);

  // Reset form state when the dialog is first opened, to make sure it's up to date
  const previousOpen = usePreviousValue(open);
  useEffect(() => {
    if (!previousOpen && open) {
      formState.onReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousOpen, open]);

  return (
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
                  !formState.hasChanges ||
                  window.confirm("Are you sure? You have unsaved changes.")
                ) {
                  onClose();
                }
              }}
            >
              Cancel
            </Button>
            <LoadingButton
              startIcon={<IconSave />}
              variant="contained"
              type="submit"
              loading={mutationStatus === "loading"}
              disabled={!formState.hasChanges || formState.hasError}
            >
              Save
            </LoadingButton>
          </DialogActions>
        </form>
      </Dialog>

      {isDefined(mutationState) && errorMessage && (
        <MutationErrorSnackbar message={errorMessage} state={mutationState} />
      )}
    </>
  );
};

export default FormDialog;
