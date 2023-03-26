import { Box, IconProps, Skeleton } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { Username_userNode$key } from "./__generated__/Username_userNode.graphql";
import HelpAnnotated from "components/common/HelpAnnotated";
import { Person as IconPerson } from "@mui/icons-material";
import GuestUserWarningText from "./GuestUserWarningText";

interface Props {
  userKey: Username_userNode$key;
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
      fragment Username_userNode on UserNode {
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
      <HelpAnnotated helpText={<GuestUserWarningText />}>
        {content}
      </HelpAnnotated>
    );
  }

  return <span>{content}</span>;
};

export default Username;
