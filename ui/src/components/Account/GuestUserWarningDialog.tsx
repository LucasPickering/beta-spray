import { queriesCurrentUserQuery } from "util/__generated__/queriesCurrentUserQuery.graphql";
import { UserQueryContext, useLogInPath } from "util/user";
import { currentUserQuery } from "util/queries";
import { withContextQuery } from "relay-query-wrapper";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { useEffect, useState } from "react";
import { GuestUserWarningDialog_currentUser$key } from "./__generated__/GuestUserWarningDialog_currentUser.graphql";
import GuestUserWarningText from "./GuestUserWarningText";

const storageKey = "guestUserWarning";
const storageValueHide = "hide";

interface Props {
  currentUserKey: GuestUserWarningDialog_currentUser$key;
}

/**
 * A dialog that warns guest users of their potential for data loss. Appears
 * the first time the site renders as a guest user, at which point it should
 * be hidden for the rest of the session.
 */
const GuestUserWarningDialog: React.FC<Props> = ({ currentUserKey }) => {
  const currentUser = useFragment(
    graphql`
      fragment GuestUserWarningDialog_currentUser on UserNodeNoUser {
        ... on UserNode {
          isGuest
        }
      }
    `,
    currentUserKey
  );

  const logInPath = useLogInPath();
  const [isOpen, setIsOpen] = useState(false);

  // Open the dialog the first time we see a guest user
  const isGuest = Boolean(currentUser?.isGuest);
  useEffect(() => {
    // Check session storage to make sure we're not annoying about it. We might
    // want to replace this with localStorage, just a matter of finding the
    // right level of annoying.
    if (isGuest && sessionStorage.getItem(storageKey) !== storageValueHide) {
      setIsOpen(true);
    }
    if (!isGuest) {
      sessionStorage.removeItem(storageKey);
    }
  }, [isGuest]);

  if (!currentUser?.isGuest) {
    return null;
  }

  const onClose = (): void => {
    setIsOpen(false);
    sessionStorage.setItem(storageKey, storageValueHide);
  };

  return (
    <Dialog open={isOpen} fullWidth onClose={onClose}>
      <DialogTitle>Logged In as Guest</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <GuestUserWarningText />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Continue as Guest</Button>
        <Button
          variant="contained"
          component={Link}
          href={logInPath}
          onClick={onClose}
          // DialogActions doesn't apply proper margin to links
          sx={{ marginLeft: 1 }}
        >
          Log In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default withContextQuery<queriesCurrentUserQuery, Props>({
  context: UserQueryContext,
  query: currentUserQuery,
  dataToProps: (data) => ({ currentUserKey: data.currentUser }),
  fallbackElement: null,
})(GuestUserWarningDialog);
