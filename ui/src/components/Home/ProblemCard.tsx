import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import { graphql, useFragment } from "react-relay";
import { Delete as IconDelete } from "@mui/icons-material";
import { ProblemCard_problemNode$key } from "./__generated__/ProblemCard_problemNode.graphql";
import LinkBehavior from "components/common/LinkBehavior";
import Editable from "components/common/Editable";
import { isDefined } from "util/func";

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "long" });

interface Props {
  problemKey: ProblemCard_problemNode$key;
  // Called _after_ taking input
  onEditName?: (problemId: string, name: string) => void;
  // Called _after_ confirmation dialog
  onDelete?: (problemId: string) => void;
}

const ProblemCard: React.FC<Props> = ({ problemKey, onEditName, onDelete }) => {
  const problem = useFragment(
    graphql`
      fragment ProblemCard_problemNode on ProblemNode {
        id
        name
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
    <Card>
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
              onChange={
                onEditName && ((newValue) => onEditName(problem.id, newValue))
              }
            />
          ) : (
            // Missing name indicates it's still loading
            <Skeleton />
          )}
        </Typography>
        <Typography variant="subtitle1" component="span" color="text.secondary">
          {dateFormat.format(new Date(problem.createdAt))}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "end" }}>
        {onDelete && (
          <Tooltip title="Delete Problem">
            <IconButton
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
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default ProblemCard;
