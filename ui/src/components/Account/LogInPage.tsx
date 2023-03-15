import { Button, Grid, Link, Paper } from "@mui/material";
import { IconGoogle } from "assets";
import Loading from "components/common/Loading";
import { graphql, useFragment } from "react-relay";
import { Navigate } from "react-router-dom";
import { withQuery } from "relay-query-wrapper";
import { currentUserQuery } from "util/queries";
import { queriesCurrentUserQuery } from "util/__generated__/queriesCurrentUserQuery.graphql";
import { LogInPage_userNode$key } from "./__generated__/LogInPage_userNode.graphql";

interface Props {
  userKey: LogInPage_userNode$key;
}

const LogInPage: React.FC<Props> = ({ userKey }) => {
  // TODO implement support for ?next= param on this page
  const currentUser = useFragment(
    graphql`
      fragment LogInPage_userNode on UserNode {
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

  // If user is already logged in, get the hell outta here
  if (currentUser.__typename === "UserNode" && !currentUser.isGuest) {
    return <Navigate to="/" replace />;
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={10} sm={6}>
        <Paper sx={{ padding: 2 }}>
          <Button
            // We're *roughly* following these guidelines
            // https://developers.google.com/identity/branding-guidelines
            // Styling is kinda shit, hopefully the big bad google man doesn't
            // come after us
            component={Link}
            href="/api/social/login/google-oauth2/"
            startIcon={<IconGoogle />}
            fullWidth
            variant="outlined"
          >
            Sign in with Google
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default withQuery<queriesCurrentUserQuery, Props>({
  query: currentUserQuery,
  dataToProps: (data) => ({ userKey: data.currentUser }),
  fallbackElement: <Loading />,
})(LogInPage);