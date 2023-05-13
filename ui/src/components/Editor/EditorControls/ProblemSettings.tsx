import useForm from "util/useForm";
import useMutation from "util/useMutation";
import { optional, validateExternalLink, validateName } from "util/validator";
import { MenuItem } from "@mui/material";
import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { graphql, useFragment } from "react-relay";
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

  const formState = useForm({
    name: { initialValue: problem.name, validator: validateName },
    externalLink: {
      initialValue: problem.externalLink,
      validator: optional(validateExternalLink),
    },
    visibility: { initialValue: problem.visibility },
  });

  const { commit: updateProblem, state: updateState } =
    useMutation<ProblemSettings_updateProblemMutation>(graphql`
      mutation ProblemSettings_updateProblemMutation(
        $input: UpdateProblemInput!
      ) @raw_response_type {
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
      formState={formState}
      mutationState={updateState}
      errorMessage="Error updating problem"
      onSave={() => {
        const name = formState.fieldStates.name.value;
        const externalLink = formState.fieldStates.externalLink.value;
        const visibility = formState.fieldStates.visibility.value;
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
      onClose={onClose}
    >
      <TextFormField label="Name" state={formState.fieldStates.name} />
      <TextFormField
        label="External Link"
        placeholder="https://mountainproject.com/..."
        state={formState.fieldStates.externalLink}
      />

      <TextFormField
        select
        label="Visibility"
        state={formState.fieldStates.visibility}
        helperText={
          visibilityHelperText[formState.fieldStates.visibility.value]
        }
        onChange={(e) =>
          formState.fieldStates.visibility.setValue(
            e.target.value as Visibility
          )
        }
      >
        <MenuItem value="UNLISTED">Unlisted</MenuItem>
        <MenuItem value="PUBLIC">Public</MenuItem>
      </TextFormField>
    </FormDialog>
  );
};

export default ProblemSettings;
