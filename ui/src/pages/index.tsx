import { Grid, Typography } from "@mui/material";
import React from "react";
import { PreloadedQuery } from "react-relay";
import type { ProblemListQuery as ProblemListQueryType } from "__generated__/ProblemListQuery.graphql";
import ProblemListQuery from "__generated__/ProblemListQuery.graphql";
import { getPreloadedQuery } from "util/environment";
import { GetServerSideProps } from "next";
import ProblemList from "components/Home/ProblemList";
import { NextPageExtended } from "./_app";

interface Props {
  queryRefs: {
    problemList: PreloadedQuery<ProblemListQueryType>;
  };
}

const Index: NextPageExtended<Props> = ({ queryRefs }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography component="h2" variant="h4">
          Problems
        </Typography>
      </Grid>

      <ProblemList queryRef={queryRefs.problemList} />
    </Grid>
  );
};

// TODO generic typing on this
export const getServerSideProps: GetServerSideProps<Props> = async () => ({
  props: {
    queryResponses: {
      problemList: await getPreloadedQuery<ProblemListQueryType>(
        ProblemListQuery,
        {}
      ),
    },
  },
});

export default Index;
