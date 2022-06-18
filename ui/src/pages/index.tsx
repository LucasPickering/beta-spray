import { Grid, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useQueryLoader } from "react-relay";
import ProblemList from "components/Home/ProblemList";
import type { ProblemListQuery as ProblemListQueryType } from "components/Home/__generated__/ProblemListQuery.graphql";
import ProblemListQuery from "components/Home/__generated__/ProblemListQuery.graphql";

const Index: React.FC = () => {
  const [queryRef, loadQuery] =
    useQueryLoader<ProblemListQueryType>(ProblemListQuery);

  useEffect(() => {
    loadQuery({});
  }, [loadQuery]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography component="h2" variant="h4">
          Problems
        </Typography>
      </Grid>

      <ProblemList queryRef={queryRef} />
    </Grid>
  );
};

export default Index;
