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

  const formState = useForm({
    name: { initialValue: beta.name, validator: validateString },
  });

  const { commit: updateBeta, state: updateState } =
    useMutation<BetaSettings_updateBetaMutation>(graphql`
      mutation BetaSettings_updateBetaMutation($input: UpdateBetaInput!)
      @raw_response_type {
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
      formState={formState}
      mutationState={updateState}
      errorMessage="Error updating beta"
      onSave={() => {
        const name = formState.fieldStates.name.value;
        updateBeta({
          variables: { input: { id: beta.id, name } },
          optimisticResponse: { updateBeta: { id: beta.id, name } },
        });
      }}
      onClose={onClose}
    >
      <TextFormField label="Name" state={formState.fieldStates.name} />
    </FormDialog>
  );
};

export default BetaSettings;
