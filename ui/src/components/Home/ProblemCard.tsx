import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Skeleton,
  Typography,
} from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { ProblemCard_problemNode$key } from "./__generated__/ProblemCard_problemNode.graphql";
import LinkBehavior from "components/common/LinkBehavior";
import { isDefined } from "util/func";
import ExternalProblemLink from "components/common/ExternalProblemLink";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

interface Props {
  problemKey: ProblemCard_problemNode$key;
}

const ProblemCard: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment ProblemCard_problemNode on ProblemNode {
        id
        name
        externalLink
        createdAt
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
          {isDefined(problem.boulder.image.url) ? (
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
          {problem.name ?? <Skeleton />}
        </Typography>

        {/* Nullish value indicates it's still loading */}
        <Typography>
          {isDefined(problem.externalLink) ? (
            <ExternalProblemLink>{problem.externalLink}</ExternalProblemLink>
          ) : (
            <Skeleton />
          )}
        </Typography>

        <Typography variant="subtitle1" component="span" color="text.secondary">
          {dateFormat.format(new Date(problem.createdAt))}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ProblemCard;
