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
import { BoulderImageCard_imageNode$key } from "./__generated__/BoulderImageCard_imageNode.graphql";

interface Props {
  imageKey: BoulderImageCard_imageNode$key;
}

const BoulderImageCard: React.FC<Props> = ({ imageKey }) => {
  const image = useFragment(
    graphql`
      fragment BoulderImageCard_imageNode on BoulderImageNode {
        id
        createdAt
        imageUrl
      }
    `,
    imageKey
  );

  return (
    <Card>
      <CardActionArea component={RouterLink} to={`/images/${image.id}`}>
        <CardMedia
          component="img"
          image={image.imageUrl}
          alt="boulder"
          sx={{
            objectFit: "cover",
            height: 200,
          }}
        />
        <CardContent>
          <Typography>{dayjs(image.createdAt).format("LLL")}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BoulderImageCard;
