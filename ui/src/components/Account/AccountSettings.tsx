import ComingSoon from "components/common/ComingSoon";
import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { graphql, useFragment } from "react-relay";
import useForm from "util/useForm";
import { validateUsername } from "util/validator";
import { AccountSettings_userNode$key } from "./__generated__/AccountSettings_userNode.graphql";

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
  // TODO mutate user here

  return (
    <FormDialog
      title="Edit Account"
      open={open}
      hasChanges={hasChanges}
      hasError={hasError}
      onClose={() => {
        onReset();
        onClose?.();
      }}
    >
      <ComingSoon>
        <TextFormField label="Username" state={usernameState} disabled />
      </ComingSoon>
    </FormDialog>
  );
};

export default AccountSettings;
