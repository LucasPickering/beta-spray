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

  const {
    fieldStates: { username: usernameState },
    hasChanges,
    hasError,
    onReset,
  } = useForm({
    username: {
      initialValue: user.username,
      validator: validateUsername,
    },
  });

  const {
    commit: updateUser,
    state: updateState,
    resetState: resetUpdateState,
  } = useMutation<AccountSettings_updateUserMutation>(graphql`
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
      hasChanges={hasChanges}
      hasError={hasError}
      mutationState={updateState}
      onSave={() => {
        const id = user.id;
        const username = usernameState.value;
        updateUser({
          variables: { input: { id, username } },
          optimisticResponse: { updateUser: { id, username } },
        });
      }}
      onClose={() => {
        onReset();
        resetUpdateState();
        onClose?.();
      }}
    >
      <TextFormField label="Username" state={usernameState} />
    </FormDialog>
  );
};

export default AccountSettings;
