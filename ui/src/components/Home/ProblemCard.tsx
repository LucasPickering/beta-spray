import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Input,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { graphql, useFragment } from "react-relay";
import {
  Edit as IconEdit,
  Delete as IconDelete,
  Done as IconDone,
} from "@mui/icons-material";
import { ProblemCard_problemNode$key } from "./__generated__/ProblemCard_problemNode.graphql";
import LinkBehavior from "components/common/LinkBehavior";

interface Props {
  problemKey: ProblemCard_problemNode$key;
  // Called _after_ taking input
  onEdit?: (problemId: string, name: string) => void;
  // Called _after_ confirmation dialog
  onDelete?: (problemId: string) => void;
}

const ProblemCard: React.FC<Props> = ({ problemKey, onEdit, onDelete }) => {
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

  const [editing, setEditing] = useState<boolean>(false);
  const [problemName, setProblemName] = useState<string>(problem.name);

  // If API's name changes, update local state. Makes sure we don't get out of
  // date if an update request fails
  useEffect(() => {
    setProblemName(problem.name);
  }, [problem.name]);

  // Pre-select first beta, if possible
  let linkPath = `/problems/${problem.id}`;
  if (problem.betas.edges.length > 0) {
    linkPath += `/beta/${problem.betas.edges[0].node.id}`;
  }

  return (
    <Card
      // Form enables name editing functionalities
      {...(editing && {
        component: "form",
        onSubmit: (e) => {
          e.preventDefault(); // Prevent page reload from form
          setEditing(false);
          if (onEdit) {
            onEdit(problem.id, problemName);
          }
        },
      })}
    >
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
        {editing ? (
          <Input
            autoFocus
            value={problemName}
            onChange={(e) => setProblemName(e.target.value)}
            sx={{ display: "block" }}
          />
        ) : (
          <Typography variant="h6" component="h3">
            {/* Missing name indicates it's still loading */}
            {problemName || <Skeleton />}
          </Typography>
        )}
        <Typography variant="subtitle1" component="span" color="text.secondary">
          {dayjs(problem.createdAt).format("LLL")}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "end" }}>
        {onEdit &&
          (editing ? (
            <Tooltip title="Save Changes">
              <IconButton type="submit" color="success">
                <IconDone />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Edit">
              <IconButton aria-label="Edit" onClick={() => setEditing(true)}>
                <IconEdit />
              </IconButton>
            </Tooltip>
          ))}
        {onDelete && (
          <IconButton
            color="error"
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete ${problemName}?`
                )
              ) {
                onDelete(problem.id);
              }
            }}
          >
            <IconDelete />
          </IconButton>
        )}
      </CardActions>
    </Card>
  );
};

export default ProblemCard;
