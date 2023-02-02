import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Skeleton,
  Typography,
} from "@mui/material";
import { graphql, useFragment } from "react-relay";
import { Delete as IconDelete } from "@mui/icons-material";
import { ProblemCard_problemNode$key } from "./__generated__/ProblemCard_problemNode.graphql";
import LinkBehavior from "components/common/LinkBehavior";
import { isDefined } from "util/func";
import TooltipIconButton from "components/common/TooltipIconButton";
import { validateExternalLink } from "util/validator";
import ExternalProblemLink from "components/common/ExternalProblemLink";
import Editable from "components/common/Editable";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

interface Props {
  problemKey: ProblemCard_problemNode$key;
  /**
   * Called to save changes to metadata. Only provided fields will be modified.
   */
  onSaveChanges?: (args: {
    problemId: string;
    name?: string;
    externalLink?: string;
  }) => void;
  /**
   * Called to delete, *after* confirmation dialog
   */
  onDelete?: (problemId: string) => void;
}

const ProblemCard: React.FC<Props> = ({
  problemKey,
  onSaveChanges,
  onDelete,
}) => {
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
          {problem.boulder.image.url ? (
            <img
              src={problem.boulder.image.url}
              alt={`${problem.name} boulder`}
              width="100%"
              height="100%"
              css={{ objectFit: "cover" }}
            />
          ) : (
            // Empty URL indicates this object was optimistically inserted, and
            // we're still waiting on the image URL from the server
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
        </CardMedia>
      </CardActionArea>

      <CardContent>
        <Typography variant="h6" component="h3">
          {isDefined(problem.name) ? (
            <Editable
              value={problem.name}
              placeholder="Problem Name"
              onChange={
                onSaveChanges &&
                ((newValue) =>
                  onSaveChanges({ problemId: problem.id, name: newValue }))
              }
            />
          ) : (
            // Missing value indicates it's still loading
            <Skeleton />
          )}
        </Typography>

        {isDefined(problem.externalLink) ? (
          <Editable
            value={problem.externalLink}
            placeholder="External Link"
            validator={validateExternalLink}
            onChange={
              onSaveChanges &&
              ((newValue) =>
                onSaveChanges({
                  problemId: problem.id,
                  externalLink: newValue,
                }))
            }
          >
            <ExternalProblemLink />
          </Editable>
        ) : (
          // Missing value indicates it's still loading
          <Skeleton />
        )}

        <Typography variant="subtitle1" component="span" color="text.secondary">
          {dateFormat.format(new Date(problem.createdAt))}
        </Typography>
      </CardContent>

      {onDelete && (
        <CardActions sx={{ justifyContent: "end" }}>
          <TooltipIconButton
            title="Delete Problem"
            color="error"
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete ${problem.name}?`
                )
              ) {
                onDelete(problem.id);
              }
            }}
          >
            <IconDelete />
          </TooltipIconButton>
        </CardActions>
      )}
    </Card>
  );
};

export default ProblemCard;
