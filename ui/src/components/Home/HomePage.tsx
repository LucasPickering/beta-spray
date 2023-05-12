import { Grid } from "@mui/material";
import { useEffect } from "react";
import { useQueryLoader } from "react-relay";
import PublicProblemList from "./PublicProblemList";
import type { YourProblemListQuery as YourProblemListQueryType } from "./__generated__/YourProblemListQuery.graphql";
import YourProblemListQuery from "./__generated__/YourProblemListQuery.graphql";
import type { PublicProblemListQuery as PublicProblemListQueryType } from "./__generated__/PublicProblemListQuery.graphql";
import PublicProblemListQuery from "./__generated__/PublicProblemListQuery.graphql";
import YourProblemList from "./YourProblemList";
import BoulderImageUpload from "./BoulderImageUpload";
import ErrorBoundary from "components/common/ErrorBoundary";

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
    loadYourProblemsQuery({ count: 6 }, { fetchPolicy: "store-and-network" });
    loadPublicProblemsQuery({ count: 6 }, { fetchPolicy: "store-and-network" });
  }, [loadYourProblemsQuery, loadPublicProblemsQuery]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <BoulderImageUpload />
      </Grid>

      <ErrorBoundary>
        <YourProblemList queryRef={yourProblemsQueryRef} />
      </ErrorBoundary>

      <ErrorBoundary>
        <PublicProblemList queryRef={publicProblemsQueryRef} />
      </ErrorBoundary>
    </Grid>
  );
};

export default HomePage;
