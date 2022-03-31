import {
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Input,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { Link as RouterLink } from "react-router-dom";
import {
  Edit as IconEdit,
  Delete as IconDelete,
  Done as IconDone,
} from "@mui/icons-material";
import { ProblemCard_problemNode$key } from "./__generated__/ProblemCard_problemNode.graphql";

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
        image {
          imageUrl
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

  return (
    <Card>
      <CardActionArea component={RouterLink} to={`/problems/${problem.id}`}>
        <CardMedia
          component="img"
          image={problem.image.imageUrl}
          alt="boulder"
          sx={{
            objectFit: "cover",
            height: 200,
          }}
        />
      </CardActionArea>

      <CardContent>
        {editing ? (
          <Input
            value={problemName}
            onChange={(e) => setProblemName(e.target.value)}
            sx={{ display: "block" }}
          />
        ) : (
          <Typography variant="h6" component="h3">
            {problemName}
          </Typography>
        )}
        <Typography variant="subtitle1" component="span" color="text.secondary">
          {dayjs(problem.createdAt).format("LLL")}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: "end" }}>
        {onEdit &&
          (editing ? (
            <IconButton
              aria-label="Save Changes"
              color="success"
              onClick={() => {
                setEditing(false);
                onEdit(problem.id, problemName);
              }}
            >
              <IconDone />
            </IconButton>
          ) : (
            // TODO auto-focus
            <IconButton aria-label="Edit" onClick={() => setEditing(true)}>
              <IconEdit />
            </IconButton>
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
