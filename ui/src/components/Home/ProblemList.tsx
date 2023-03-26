import { Button, Grid, GridProps } from "@mui/material";
import { graphql, useFragment } from "react-relay";
import ProblemCard, { ProblemCardSkeleton } from "./ProblemCard";
import { ProblemList_problemNodeConnection$key } from "./__generated__/ProblemList_problemNodeConnection.graphql";

interface Props {
  problemConnectionKey: ProblemList_problemNodeConnection$key;
  hasNext?: boolean;
  loadNext?: (count: number) => void;
}

const ProblemList: React.FC<Props> = ({
  problemConnectionKey,
  hasNext = false,
  loadNext,
}) => {
  const problems = useFragment(
    graphql`
      fragment ProblemList_problemNodeConnection on ProblemNodeConnection {
        edges {
          node {
            id
            ...ProblemCard_problemNode
          }
        }
      }
    `,
    problemConnectionKey
  );

  return (
    <>
      {problems.edges.map(({ node }) => (
        <ProblemListGridItem key={node.id}>
          <ProblemCard problemKey={node} />
        </ProblemListGridItem>
      ))}

      {hasNext ? (
        <Grid item xs={12}>
          <Button fullWidth onClick={loadNext && (() => loadNext(10))}>
            Load More
          </Button>
        </Grid>
      ) : null}
    </>
  );
};

/**
 * Little helper for all the different items that can appear in the grid, since
 * they're all the same size.
 */
const ProblemListGridItem: React.FC<GridProps> = (props) => (
  <Grid item xs={12} sm={6} md={4} {...props} />
);

/**
 * Loading placeholder for ProblemList
 */
export const ProblemListSkeleton: React.FC = () => (
  <>
    <ProblemListGridItem>
      <ProblemCardSkeleton />
    </ProblemListGridItem>
    <ProblemListGridItem>
      <ProblemCardSkeleton />
    </ProblemListGridItem>
    <ProblemListGridItem>
      <ProblemCardSkeleton />
    </ProblemListGridItem>
  </>
);

export default ProblemList;
