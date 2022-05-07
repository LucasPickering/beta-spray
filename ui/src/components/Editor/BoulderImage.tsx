import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BoulderImage_boulderNode$key } from "./__generated__/BoulderImage_boulderNode.graphql";

interface Props {
  boulderKey: BoulderImage_boulderNode$key;
  onLoad: JSX.IntrinsicElements["img"]["onLoad"];
}

/**
 * Boulder background image
 */
const BoulderImage: React.FC<Props> = ({ boulderKey, onLoad }) => {
  const boulder = useFragment(
    graphql`
      fragment BoulderImage_boulderNode on BoulderNode {
        image {
          url
        }
      }
    `,
    boulderKey
  );

  return (
    <img
      src={boulder.image.url}
      alt="Boulder"
      onLoad={onLoad}
      // Jank to account for header height
      css={{ maxWidth: "100vw", maxHeight: "calc(100vh - 48px)" }}
    />
  );
};

export default BoulderImage;
