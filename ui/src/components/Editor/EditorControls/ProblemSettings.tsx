import { MenuItem } from "@mui/material";
import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { graphql, useFragment } from "react-relay";
import useForm from "util/useForm";
import useMutation from "util/useMutation";
import { validateExternalLink, validateString } from "util/validator";
import {
  ProblemSettings_problemNode$key,
  Visibility,
} from "./__generated__/ProblemSettings_problemNode.graphql";
import { ProblemSettings_updateProblemMutation } from "./__generated__/ProblemSettings_updateProblemMutation.graphql";

interface Props {
  problemKey: ProblemSettings_problemNode$key;
  open: boolean;
  onClose?: () => void;
}

const visibilityHelperText: Record<Visibility, string> = {
  UNLISTED: "Visible to anyone with the link",
  PUBLIC: "Visible and searchable to all users",
};

/**
 * A dialog to edit problem metadata.
 */
const ProblemSettings: React.FC<Props> = ({ problemKey, open, onClose }) => {
  const problem = useFragment(
    graphql`
      fragment ProblemSettings_problemNode on ProblemNode {
        id
        name
        externalLink
        visibility
      }
    `,
    problemKey
  );

  const {
    fieldStates: {
      name: nameState,
      externalLink: externalLinkState,
      visibility: visibilityState,
    },
    hasChanges,
    hasError,
    onReset,
  } = useForm(
    {
      name: { initialValue: problem.name, validator: validateString },
      externalLink: {
        initialValue: problem.externalLink,
        validator: validateExternalLink,
      },
      visibility: { initialValue: problem.visibility },
    },
    !open
  );

  const {
    commit: updateProblem,
    state: updateState,
    resetState: resetUpdateState,
  } = useMutation<ProblemSettings_updateProblemMutation>(graphql`
    mutation ProblemSettings_updateProblemMutation(
      $input: UpdateProblemInput!
    ) {
      updateProblem(input: $input) {
        id
        name
        externalLink
        visibility
      }
    }
  `);

  return (
    <FormDialog
      open={open}
      title="Edit Problem"
      hasChanges={hasChanges}
      hasError={hasError}
      mutationState={updateState}
      errorMessage="Error updating problem"
      onSave={() => {
        const name = nameState.value;
        const externalLink = externalLinkState.value;
        const visibility = visibilityState.value;
        updateProblem({
          variables: {
            input: { id: problem.id, name, externalLink, visibility },
          },
          optimisticResponse: {
            updateProblem: {
              id: problem.id,
              name,
              externalLink,
              visibility,
            },
          },
        });
      }}
      onClose={() => {
        onReset();
        resetUpdateState();
        onClose?.();
      }}
    >
      <TextFormField label="Name" state={nameState} />
      <TextFormField
        label="External Link"
        placeholder="https://mountainproject.com/..."
        state={externalLinkState}
      />

      <TextFormField
        select
        label="Visibility"
        state={visibilityState}
        helperText={visibilityHelperText[visibilityState.value]}
        onChange={(e) => visibilityState.setValue(e.target.value as Visibility)}
      >
        <MenuItem value="UNLISTED">Unlisted</MenuItem>
        <MenuItem value="PUBLIC">Public</MenuItem>
      </TextFormField>
    </FormDialog>
  );
};

export default ProblemSettings;
