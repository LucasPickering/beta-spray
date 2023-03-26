import { Grid, Typography } from "@mui/material";
import { useEffect } from "react";
import { useQueryLoader } from "react-relay";
import PublicProblemList from "./PublicProblemList";
import type { YourProblemListQuery as YourProblemListQueryType } from "./__generated__/YourProblemListQuery.graphql";
import YourProblemListQuery from "./__generated__/YourProblemListQuery.graphql";
import type { PublicProblemListQuery as PublicProblemListQueryType } from "./__generated__/PublicProblemListQuery.graphql";
import PublicProblemListQuery from "./__generated__/PublicProblemListQuery.graphql";
import YourProblemList from "./YourProblemList";
import BoulderImageUpload from "./BoulderImageUpload";

const HomePage: React.FC = () => {
  const [yourProblemsQueryRef, loadYourProblemsQuery] =
    useQueryLoader<YourProblemListQueryType>(YourProblemListQuery);
  const [publicProblemsQueryRef, loadPublicProblemsQuery] =
    useQueryLoader<PublicProblemListQueryType>(PublicProblemListQuery);

  useEffect(() => {
    // Don't load too many by default, so mobile users don't have to scroll far
    // Problem lists are pretty dynamic (can be changed on other pages and by
    // other users), so we want to refetch any time we load this page. This
    // also saves us the hassle of complicated optimistic responses
    loadYourProblemsQuery({ count: 3 }, { fetchPolicy: "store-and-network" });
    loadPublicProblemsQuery({ count: 3 }, { fetchPolicy: "store-and-network" });
  }, [loadYourProblemsQuery, loadPublicProblemsQuery]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <BoulderImageUpload />
      </Grid>

      <Grid item xs={12}>
        <Typography component="h2" variant="h4">
          Your Problems
        </Typography>
      </Grid>
      <YourProblemList queryRef={yourProblemsQueryRef} />

      <Grid item xs={12}>
        <Typography component="h2" variant="h4">
          Around the World
        </Typography>
      </Grid>
      <PublicProblemList queryRef={publicProblemsQueryRef} />
    </Grid>
  );
};

export default HomePage;
