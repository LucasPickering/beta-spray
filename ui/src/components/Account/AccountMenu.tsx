import {
  AccountCircle as IconAccountCircle,
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
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { useNavigate } from "react-router-dom";
import useMutation from "util/useMutation";
import AccountSettings from "./AccountSettings";
import { AccountMenuQuery } from "./__generated__/AccountMenuQuery.graphql";
import { AccountMenu_logOutMutation } from "./__generated__/AccountMenu_logOutMutation.graphql";

const googleLoginPath = "/api/social/login/google-oauth2/";

/**
 * Component in the top-right indicating account status. There are three
 * account modes we care about:
 * - No account (new user/signed out)
 * - Guest account (new user who's performed a mutation)
 * - Authenticated user (they went through the sign in process)
 */
const AccountMenu: React.FC = () => {
  // Lazy loading is fine here, since this should be part of the first render
  // of every page
  // TODO get this to reload after performing any mutation (hard)
  const { currentUser } = useLazyLoadQuery<AccountMenuQuery>(
    graphql`
      query AccountMenuQuery {
        # There's a NoUser variant to indicate not logged in. Intuitively we
        # could just make this nullable, but then it's not possible to invalidate
        # this from an updater, which we want to do from any mutation, to trigger
        # reloading the guest user
        currentUser {
          __typename
          ... on UserNode {
            username
            isGuest
            ...AccountSettings_currentUserNode
          }
        }
      }
    `,
    {}
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
    // TODO google logo and shit
    return (
      <Button component={Link} href={googleLoginPath}>
        Log in
      </Button>
    );
  }

  // Logged In
  return (
    <>
      <ActionsMenu title="Account Menu" icon={<IconAccountCircle />}>
        <ListItem>{currentUser.username}</ListItem>
        <Divider />
        {/* TODO google logo */}
        {currentUser.isGuest && (
          <MenuItem component={Link} href={googleLoginPath}>
            Log in with Google
          </MenuItem>
        )}

        <MenuItem onClick={() => setIsSettingsOpen(true)}>
          <ListItemIcon>
            <IconSettings />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
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

export default AccountMenu;
