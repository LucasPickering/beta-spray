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
          path
          holds {
            edges {
              node {
                id
                positionX
                positionY
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  if (!data.image) {
    return <NotFound />;
  }

  return (
    <div style={{ position: "relative" }}>
      <img
        src={data.image.path}
        alt="Boulder"
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {data.image.holds.edges.map(({ node }) => (
        <span
          key={node.id}
          style={{
            position: "absolute",
            backgroundColor: "red",
            left: `${node.positionX * 100}%`,
            top: `${node.positionY * 100}%`,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </div>
  );
};

export default BoulderImage;
