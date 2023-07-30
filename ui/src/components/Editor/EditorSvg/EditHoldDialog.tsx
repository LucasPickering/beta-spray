import useForm from "util/useForm";
import { MutationState } from "util/useMutation";
import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { graphql, useFragment } from "react-relay";
import { ToggleButton } from "@mui/material";
import ToggleButtonFormField from "components/common/ToggleButtonFormField";
import { HoldKind, allHoldKinds, formatHoldKind } from "../util/svg";
import { EditHoldDialog_holdNode$key } from "./__generated__/EditHoldDialog_holdNode.graphql";
import { HoldIconWrapped } from "./HoldEditor/HoldIcon";

interface Props {
  holdKey: EditHoldDialog_holdNode$key | null;
  mutationState: MutationState;
  open: boolean;
  onClose?: () => void;
  onSave?: (fields: { kind: HoldKind; annotation: string }) => void;
}

/**
 * Dialog to edit metadata for a hold.
 */
const EditHoldDialog: React.FC<Props> = ({
  holdKey,
  open,
  mutationState,
  onSave,
  onClose,
}) => {
  const hold = useFragment(
    graphql`
      fragment EditHoldDialog_holdNode on HoldNode {
        id
        kind
        annotation
      }
    `,
    holdKey
  );

  // Local state, will be propagated on submission
  const formState = useForm({
    // Defaults are only used while modal is closing
    kind: { initialValue: hold?.kind ?? "JUG" },
    annotation: { initialValue: hold?.annotation ?? "" },
  });

  // Opened by the Edit button. Always save on exit.
  return (
    <FormDialog
      title="Edit Hold"
      open={open}
      formState={formState}
      mutationState={mutationState}
      errorMessage="Error updating notes"
      onClose={onClose}
      onSave={() =>
        onSave?.({
          kind: formState.fieldStates.kind.value,
          annotation: formState.fieldStates.annotation.value,
        })
      }
    >
      <ToggleButtonFormField state={formState.fieldStates.kind} size="small">
        {allHoldKinds.map((kind) => (
          <ToggleButton
            key={kind}
            title={formatHoldKind(kind)}
            value={kind}
            sx={{ flexDirection: "column" }}
          >
            <span>{formatHoldKind(kind)}</span>
            <HoldIconWrapped kind={kind} />
          </ToggleButton>
        ))}
      </ToggleButtonFormField>
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

export default EditHoldDialog;
