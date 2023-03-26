import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { graphql, useFragment } from "react-relay";
import useForm from "util/useForm";
import useMutation from "util/useMutation";
import { validateString } from "util/validator";
import { BetaSettings_betaNode$key } from "./__generated__/BetaSettings_betaNode.graphql";
import { BetaSettings_updateBetaMutation } from "./__generated__/BetaSettings_updateBetaMutation.graphql";

interface Props {
  betaKey: BetaSettings_betaNode$key;
  open: boolean;
  onClose?: () => void;
}

/**
 * A dialog to edit beta metadata.
 */
const BetaSettings: React.FC<Props> = ({ betaKey, open, onClose }) => {
  const beta = useFragment(
    graphql`
      fragment BetaSettings_betaNode on BetaNode {
        id
        name
      }
    `,
    betaKey
  );

  const {
    fieldStates: { name: nameState },
    hasChanges,
    hasError,
    onReset,
  } = useForm(
    { name: { initialValue: beta.name, validator: validateString } },
    !open
  );

  const {
    commit: updateBeta,
    state: updateState,
    resetState: resetUpdateState,
  } = useMutation<BetaSettings_updateBetaMutation>(graphql`
    mutation BetaSettings_updateBetaMutation($input: UpdateBetaInput!) {
      updateBeta(input: $input) {
        id
        name
      }
    }
  `);

  return (
    <FormDialog
      open={open}
      title="Edit Beta"
      hasChanges={hasChanges}
      hasError={hasError}
      mutationState={updateState}
      errorMessage="Error updating beta"
      onSave={() => {
        const name = nameState.value;
        updateBeta({
          variables: { input: { id: beta.id, name } },
          optimisticResponse: { updateBeta: { id: beta.id, name } },
        });
      }}
      onClose={() => {
        onReset();
        resetUpdateState();
        onClose?.();
      }}
    >
      <TextFormField label="Name" state={nameState} />
    </FormDialog>
  );
};

export default BetaSettings;
