import { Link } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { UsernameDisplay_userNode$key } from "./__generated__/UsernameDisplay_userNode.graphql";
import HelpAnnotated from "components/common/HelpAnnotated";

interface Props {
  userKey: UsernameDisplay_userNode$key;
}

const UsernameDisplay: React.FC<Props> = ({ userKey }) => {
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
        {user.username}
      </HelpAnnotated>
    );
  }

  return <span>{user.username}</span>;
};

export default UsernameDisplay;
