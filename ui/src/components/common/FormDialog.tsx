import { MutationState } from "util/useMutation";
import { FormState } from "util/useForm";
import { isDefined } from "util/func";
import usePreviousValue from "util/usePreviousValue";
import { Clear as IconClear, Save as IconSave } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { useCallback, useEffect } from "react";
import MutationErrorSnackbar from "./MutationErrorSnackbar";

interface Props {
  title: string;
  open: boolean;
  formState: FormState<unknown>;
  mutationState: MutationState;
  closeOnSuccess?: boolean;
  assumeHasChanges?: boolean;
  cancelWarningMessage?: string;
  errorMessage?: string;
  componentProps?: { cancelButton?: ButtonProps; saveButton?: ButtonProps };
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
 *
 * @param title Dialog title text
 * @param open Controlled open state flag
 * @param formState FormState object from useForm
 * @param mutationState MutationState object from useMutation
 * @param closeOnSuccess Close the dialog when the mutation is successful?
 * @param assumeHasChanges Treat the form as always "having changes", meaning
 *  saving will be enabled (barring validation errors) and cancelling will
 *  trigger a warning dialog.
 * @param cancelWarningMessage Message to show when cancelling out of the
 *  dialog with unsaved changes
 * @param errorMessage Message to show in a snackbar if the mutation fails
 * @param componentProps Props to forward to child components
 * @param onSave Callback when save button is clicked
 * @param onClose Callback to close the dialog (for both cancel *and* success)
 * @param children Dialog contents
 */
const FormDialog: React.FC<Props> = ({
  title,
  open,
  formState,
  mutationState,
  closeOnSuccess = true,
  assumeHasChanges = false,
  cancelWarningMessage = "Are you sure? You have unsaved changes.",
  errorMessage,
  componentProps: {
    cancelButton: cancelButtonProps,
    saveButton: saveButtonProps,
  } = {},
  onSave,
  onClose: onCloseProp,
  children,
}) => {
  const hasChanges = assumeHasChanges || formState.hasChanges;

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
                if (!hasChanges || window.confirm(cancelWarningMessage)) {
                  onClose();
                }
              }}
              // children needs to be a prop so it can be overriden
              // eslint-disable-next-line react/no-children-prop
              children="Cancel"
              {...cancelButtonProps}
            />
            <LoadingButton
              startIcon={<IconSave />}
              variant="contained"
              type="submit"
              loading={mutationStatus === "loading"}
              disabled={!hasChanges || formState.hasError}
              // children needs to be a prop so it can be overriden
              // eslint-disable-next-line react/no-children-prop
              children="Save"
              {...saveButtonProps}
            />
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
