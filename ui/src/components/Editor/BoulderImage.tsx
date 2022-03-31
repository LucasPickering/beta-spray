import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BoulderImage_imageNode$key } from "./__generated__/BoulderImage_imageNode.graphql";

interface Props {
  imageKey: BoulderImage_imageNode$key;
  onLoad: JSX.IntrinsicElements["img"]["onLoad"];
}

/**
 * Boulder background image
 */
const BoulderImage: React.FC<Props> = ({ imageKey, onLoad }) => {
  const image = useFragment(
    graphql`
      fragment BoulderImage_imageNode on BoulderImageNode {
        imageUrl
      }
    `,
    imageKey
  );

  return (
    <img
      src={image.imageUrl}
      alt="Boulder"
      onLoad={onLoad}
      // Jank to account for header height
      css={{ maxWidth: "100vw", maxHeight: "calc(100vh - 48px)" }}
    />
  );
};

export default BoulderImage;
