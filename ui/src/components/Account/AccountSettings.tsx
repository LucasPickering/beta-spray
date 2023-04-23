import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { graphql, useFragment } from "react-relay";
import useForm from "util/useForm";
import { validateUsername } from "util/validator";
import { AccountSettings_userNode$key } from "./__generated__/AccountSettings_userNode.graphql";
import useMutation from "util/useMutation";
import { AccountSettings_updateUserMutation } from "./__generated__/AccountSettings_updateUserMutation.graphql";

interface Props {
  userKey: AccountSettings_userNode$key;
  open: boolean;
  onClose?: () => void;
}

/**
 * Dialog for editing account settings (username, etc.)
 */
const AccountSettings: React.FC<Props> = ({ userKey, open, onClose }) => {
  const user = useFragment(
    graphql`
      fragment AccountSettings_userNode on UserNode {
        id
        username
      }
    `,
    userKey
  );

  const formState = useForm({
    username: {
      initialValue: user.username,
      validator: validateUsername,
    },
  });

  const { commit: updateUser, state: updateState } =
    useMutation<AccountSettings_updateUserMutation>(graphql`
      mutation AccountSettings_updateUserMutation($input: UpdateUserInput!)
      @raw_response_type {
        updateUser(input: $input) {
          id
          username
        }
      }
    `);

  return (
    <FormDialog
      title="Edit Account"
      open={open}
      formState={formState}
      mutationState={updateState}
      errorMessage="Error updating settings"
      onSave={() => {
        const id = user.id;
        const username = formState.fieldStates.username.value;
        updateUser({
          variables: { input: { id, username } },
          optimisticResponse: { updateUser: { id, username } },
        });
      }}
      onClose={onClose}
    >
      <TextFormField label="Username" state={formState.fieldStates.username} />
    </FormDialog>
  );
};

export default AccountSettings;
