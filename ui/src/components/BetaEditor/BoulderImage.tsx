import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BoulderImage_image$key } from "./__generated__/BoulderImage_image.graphql";

interface Props {
  dataKey: BoulderImage_image$key;
  onLoad: JSX.IntrinsicElements["img"]["onLoad"];
}

/**
 * Boulder background image
 */
const BoulderImage: React.FC<Props> = ({ dataKey, onLoad }) => {
  const data = useFragment(
    graphql`
      fragment BoulderImage_image on BoulderImageNode {
        imageUrl
      }
    `,
    dataKey
  );

  return (
    <img
      src={data.imageUrl}
      alt="Boulder"
      onLoad={onLoad}
      style={{ height: "100%" }}
    />
  );
};

export default BoulderImage;
