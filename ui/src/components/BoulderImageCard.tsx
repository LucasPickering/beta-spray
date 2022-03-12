import { Box, Link } from "@chakra-ui/react";
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
    <Link as={RouterLink} to={`/images/${image.id}`}>
      <Box margin={4}>
        <img
          src={image.imageUrl}
          alt="boulder"
          style={{ width: 400, height: 120, objectFit: "cover" }}
        />

        {dayjs(image.createdAt).format("LLL")}
      </Box>
    </Link>
  );
};

export default BoulderImageCard;
