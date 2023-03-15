import {
  AccountCircle as IconAccountCircle,
  Login as IconLogin,
  Logout as IconLogout,
  Settings as IconSettings,
} from "@mui/icons-material";
import {
  Button,
  Divider,
  Link,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import ActionsMenu from "components/common/ActionsMenu";
import Loading from "components/common/Loading";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { useNavigate } from "react-router-dom";
import { withQuery } from "relay-query-wrapper";
import { currentUserQuery } from "util/queries";
import useMutation from "util/useMutation";
import { queriesCurrentUserQuery } from "util/__generated__/queriesCurrentUserQuery.graphql";
import AccountSettings from "./AccountSettings";
import { AccountMenu_logOutMutation } from "./__generated__/AccountMenu_logOutMutation.graphql";
import { AccountMenu_userNode$key } from "./__generated__/AccountMenu_userNode.graphql";

interface Props {
  userKey: AccountMenu_userNode$key;
}

/**
 * Component in the top-right indicating account status. There are three
 * account modes we care about:
 * - No account (new user/signed out)
 * - Guest account (new user who's performed a mutation)
 * - Authenticated user (they went through the sign in process)
 */
const AccountMenu: React.FC<Props> = ({ userKey }) => {
  // Lazy loading is fine here, since this should be part of the first render
  // of every page
  // TODO get this to reload after performing any mutation (hard)
  const currentUser = useFragment(
    graphql`
      fragment AccountMenu_userNode on UserNode {
        # There's a NoUser variant to indicate not logged in. Intuitively we
        # could just make this nullable, but then it's not possible to invalidate
        # this from an updater, which we want to do from any mutation, to trigger
        # reloading the guest user
        __typename
        ... on UserNode {
          username
          isGuest
          ...AccountSettings_currentUserNode
        }
      }
    `,
    userKey
  );

  const { commit: logOut, state: logOutState } =
    useMutation<AccountMenu_logOutMutation>(graphql`
      mutation AccountMenu_logOutMutation {
        logOut
      }
    `);

  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Logged Out
  if (currentUser.__typename !== "UserNode") {
    return (
      <Button component={Link} href="/login">
        Log in
      </Button>
    );
  }

  const { isGuest } = currentUser;

  // Logged In
  return (
    <>
      <ActionsMenu title="Account Menu" icon={<IconAccountCircle />}>
        <ListItem>{currentUser.username}</ListItem>
        <Divider />

        {isGuest && (
          <MenuItem component={Link} href="/login">
            <ListItemIcon>
              <IconLogin />
            </ListItemIcon>
            <ListItemText>Log in</ListItemText>
          </MenuItem>
        )}

        <MenuItem disabled={isGuest} onClick={() => setIsSettingsOpen(true)}>
          <ListItemIcon>
            <IconSettings />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        {!isGuest && (
          <MenuItem
            onClick={() =>
              logOut({
                variables: {},
                onCompleted() {
                  // Reload the page, since a lot of content can change
                  navigate(0);
                },
              })
            }
          >
            <ListItemIcon>
              <IconLogout />
            </ListItemIcon>
            <ListItemText>Log out</ListItemText>
          </MenuItem>
        )}
      </ActionsMenu>

      <AccountSettings
        currentUserKey={currentUser}
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <MutationErrorSnackbar message="Error logging out" state={logOutState} />
    </>
  );
};

export default withQuery<queriesCurrentUserQuery, Props>({
  query: currentUserQuery,
  dataToProps: (data) => ({ userKey: data.currentUser }),
  fallbackElement: <Loading />,
})(AccountMenu);
