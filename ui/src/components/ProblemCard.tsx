import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import React from "react";
import { graphql, useFragment } from "react-relay";
import { Link as RouterLink } from "react-router-dom";
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
        createdAt
        image {
          imageUrl
        }
      }
    `,
    problemKey
  );

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
        <CardContent>
          <Typography>{problem.name}</Typography>
          <Typography>{dayjs(problem.createdAt).format("LLL")}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default ProblemCard;
