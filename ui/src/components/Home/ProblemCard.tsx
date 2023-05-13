import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Skeleton,
  Typography,
} from "@mui/material";
import { graphql, useFragment } from "react-relay";
import LinkBehavior from "components/common/LinkBehavior";
import ExternalProblemLink from "components/common/ExternalProblemLink";
import Username from "components/Account/Username";
import { ProblemCard_problemNode$key } from "./__generated__/ProblemCard_problemNode.graphql";

interface Props {
  problemKey: ProblemCard_problemNode$key;
}

const ProblemCard: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment ProblemCard_problemNode on ProblemNode {
        id
        name
        owner {
          ...Username_userNode
        }
        externalLink
        boulder {
          image {
            url
          }
        }
        # We only need one beta, to pre-select it
        betas(first: 1) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    problemKey
  );

  // Pre-select first beta, if possible
  let linkPath = `/problems/${problem.id}`;
  if (problem.betas.edges.length > 0) {
    linkPath += `/beta/${problem.betas.edges[0].node.id}`;
  }

  return (
    <Card sx={{ height: "100%" }}>
      <CardActionArea component={LinkBehavior} href={linkPath}>
        <CardMedia sx={{ height: 200 }}>
          {problem.boulder.image.url ? (
            <img
              src={problem.boulder.image.url}
              alt={`${problem.name} boulder`}
              width="100%"
              height="100%"
              css={{ objectFit: "cover" }}
            />
          ) : (
            // Nullish URL indicates this object was optimistically inserted,
            // and we're still waiting on the image URL from the server
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
        </CardMedia>
      </CardActionArea>

      <CardContent>
        <Typography variant="h6" component="h3">
          {/* Nullish value indicates it's still loading */}
          {problem.name || <Skeleton />}
        </Typography>

        {/* Empty value could be loading *or* it's just empty */}
        {problem.externalLink && (
          <Typography>
            <ExternalProblemLink>{problem.externalLink}</ExternalProblemLink>
          </Typography>
        )}

        <Typography variant="subtitle1" component="span" color="text.secondary">
          <Username userKey={problem.owner} />
        </Typography>
      </CardContent>
    </Card>
  );
};

/**
 * Loading placeholder for ProblemCard
 */
export const ProblemCardSkeleton: React.FC = () => (
  <Skeleton variant="rectangular" height={348} />
);

export default ProblemCard;
