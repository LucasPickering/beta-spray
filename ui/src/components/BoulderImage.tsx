import React from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";
import NotFound from "./NotFound";
import { BoulderImageQuery } from "./__generated__/BoulderImageQuery.graphql";

interface Props {
  queryRef: PreloadedQuery<BoulderImageQuery>;
}

const BoulderImage: React.FC<Props> = ({ queryRef }) => {
  const data = usePreloadedQuery<BoulderImageQuery>(
    graphql`
      query BoulderImageQuery($imageId: ID!) {
        image(id: $imageId) {
          id
          path
        }
      }
    `,
    queryRef
  );

  if (!data.image) {
    return <NotFound />;
  }

  return <img src={data.image.path} alt="Boulder" />;
};

export default BoulderImage;
