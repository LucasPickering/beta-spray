import { Link } from "@mui/material";
import { useLogInPath } from "util/user";

/**
 * Friendly little text blob warning user that their shit could get lost.
 */
const GuestUserWarningText: React.FC = () => {
  const logInPath = useLogInPath();
  return (
    <>
      You are logged in as a guest. Any content (problems, beta, etc.) you share
      will be saved, but you won't be able to edit it from any other device, and
      sharing options are limited. If you ever lose access to this guest
      account, <b>you will not be able to edit your content</b>. To secure
      permanent access to your content, <Link href={logInPath}>log in</Link>. No
      password required, and all your content will be transferred to your new
      account.
    </>
  );
};

export default GuestUserWarningText;
