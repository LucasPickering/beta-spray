import { Grid, Typography } from "@mui/material";
import React from "react";
import { PreloadedQuery } from "react-relay";
import type { ProblemListQuery as ProblemListQueryType } from "__generated__/ProblemListQuery.graphql";
import ProblemListQuery from "__generated__/ProblemListQuery.graphql";
import { getPreloadedQuery } from "util/environment";
import ProblemList from "components/Home/ProblemList";
import { NextPageExtended } from "./_app";
import { getQueryProps, GetServerSideQueryProps } from "util/relay";

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

export const getServerSideProps: GetServerSideQueryProps<Props> = async () =>
  getQueryProps({
    problemList: getPreloadedQuery<ProblemListQueryType>(ProblemListQuery),
  });

export default Index;
