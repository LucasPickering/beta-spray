import { Box, IconProps, Link, Skeleton } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { UsernameDisplay_userNode$key } from "./__generated__/UsernameDisplay_userNode.graphql";
import HelpAnnotated from "components/common/HelpAnnotated";
import { Person as IconPerson } from "@mui/icons-material";

interface Props {
  userKey: UsernameDisplay_userNode$key;
  iconSize?: IconProps["fontSize"];
}

/**
 * Render a username in a friendly way. Includes an icon, and if the user is
 * the current user, we'll show some extra context. This will inherit the
 * typography of the parent.
 */
const Username: React.FC<Props> = ({ userKey, iconSize }) => {
  const user = useFragment(
    graphql`
      fragment UsernameDisplay_userNode on UserNode {
        username
        isCurrentUser
        isGuest
      }
    `,
    userKey
  );

  // Sorry Franco :(
  const content = (
    <Box display="flex" alignItems="center">
      <IconPerson fontSize={iconSize} />
      {/* Empty username indicates it's loading */}
      {user.username || <Skeleton />}
    </Box>
  );

  // For guest users, show a tooltip explaining the situation.
  if (user.isCurrentUser && user.isGuest) {
    return (
      <HelpAnnotated
        helpText={
          <>
            You are logged in as a guest. Any content (problems, beta, etc.) you
            share will be saved, but you won't be able to edit it from any other
            device, and sharing options are limited. If you ever lose access to
            this guest account, <b>you will not be able to edit your content</b>
            . To secure permanent access to your content,{" "}
            <Link href="/login">log in</Link>. All your content will be
            transferred to your new account.
          </>
        }
      >
        {content}
      </HelpAnnotated>
    );
  }

  return <span>{content}</span>;
};

export default Username;
