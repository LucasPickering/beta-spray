import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import useForm from "util/useForm";
import { MutationState } from "util/useMutation";

interface Props {
  title: string;
  annotation: string | undefined;
  mutationState: MutationState;
  open: boolean;
  onClose?: () => void;
  onSave?: (newValue: string) => void;
}

/**
 * Dialog to edit the annotation on a hold or beta move.
 */
const EditAnnotationDialog: React.FC<Props> = ({
  annotation,
  title,
  open,
  mutationState,
  onSave,
  onClose,
}) => {
  // Local state, will be propagated on submission
  const formState = useForm({ annotation: { initialValue: annotation ?? "" } });

  // Opened by the Edit button. Always save on exit.
  return (
    <FormDialog
      title={title}
      open={open}
      formState={formState}
      mutationState={mutationState}
      onClose={onClose}
      onSave={() => onSave?.(formState.fieldStates.annotation.value)}
    >
      <TextFormField
        autoFocus // Doesn't work in dev https://github.com/mui/material-ui/issues/33004
        label="Notes"
        state={formState.fieldStates.annotation}
        sx={{
          width: "100%",
          marginTop: 1, // Prevents cutting off label on top
        }}
      />
    </FormDialog>
  );
};

export default EditAnnotationDialog;
