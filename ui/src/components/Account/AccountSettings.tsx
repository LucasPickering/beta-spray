import ComingSoon from "components/common/ComingSoon";
import FormDialog from "components/common/FormDialog";
import TextFormField from "components/common/TextFormField";
import { graphql, useFragment } from "react-relay";
import useForm from "util/useForm";
import { validateUsername } from "util/validator";
import { AccountSettings_currentUserNode$key } from "./__generated__/AccountSettings_currentUserNode.graphql";

interface Props {
  currentUserKey: AccountSettings_currentUserNode$key;
  open: boolean;
  onClose?: () => void;
}

/**
 * Dialog for editing account settings (username, etc.)
 */
const AccountSettings: React.FC<Props> = ({
  currentUserKey,
  open,
  onClose,
}) => {
  const currentUser = useFragment(
    graphql`
      fragment AccountSettings_currentUserNode on UserNode {
        username
      }
    `,
    currentUserKey
  );

  const {
    fieldStates: { username: usernameState },
    hasChanges,
    hasError,
    onReset,
  } = useForm({
    username: {
      initialValue: currentUser.username,
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
