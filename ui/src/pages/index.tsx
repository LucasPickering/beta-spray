import { Grid, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { usePreloadedQuery, useQueryLoader } from "react-relay";
import ProblemList from "components/Home/ProblemList";
import type { pagesQuery as pagesQueryType } from "./__generated__/pagesQuery.graphql";
import { getClientEnvironment } from "util/environment";
import { RelayProps, withRelay } from "relay-nextjs";

const Index: React.FC = () => {
  // const [queryRef, loadQuery] =
  //   useQueryLoader<ProblemListQueryType>(ProblemListQuery);

  // useEffect(() => {
  //   loadQuery({});
  // }, [loadQuery]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography component="h2" variant="h4">
          Problems
        </Typography>
      </Grid>

      <ProblemList />
    </Grid>
  );
};

export default Index;
