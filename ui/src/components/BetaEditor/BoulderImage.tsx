import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BoulderImage_image$key } from "./__generated__/BoulderImage_image.graphql";

interface Props {
  imageKey: BoulderImage_image$key;
  onLoad: JSX.IntrinsicElements["img"]["onLoad"];
}

const BoulderImage: React.FC<Props> = ({ imageKey, onLoad }) => {
  const data = useFragment(
    graphql`
      fragment BoulderImage_image on BoulderImageNode {
        path
      }
    `,
    imageKey
  );

  return (
    <img
      src={data.path}
      alt="Boulder"
      onLoad={onLoad}
      style={{ height: "100%" }}
    />
  );
};

export default BoulderImage;
