import React, { useState } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { BoulderImage_image$key } from "./__generated__/BoulderImage_image.graphql";

interface Props {
  imageKey: BoulderImage_image$key;
}

const BoulderImage: React.FC<Props> = ({ imageKey }) => {
  const data = useFragment(
    graphql`
      fragment BoulderImage_image on BoulderImageNode {
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
    `,
    imageKey
  );

  // Aspect ratio is needed in order to scale the SVG to the raster image
  const [aspectRatio, setAspectRatio] = useState<number>(1.0);

  return (
    <div
      style={{ position: "relative", display: "inline-block", height: "100vh" }}
    >
      <img
        src={data.path}
        alt="Boulder"
        onLoad={(e) => {
          const el = e.currentTarget;
          setAspectRatio(el.width / el.height);
        }}
        style={{
          height: "100%",
        }}
      />
      <svg
        viewBox={`0 0 100 ${100 / aspectRatio}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {data.holds.edges.map(({ node }) => (
          <circle
            key={node.id}
            r={1}
            cx={node.positionX * 100}
            cy={(node.positionY * 100) / aspectRatio}
            fill="red"
            opacity={0.5}
          />
        ))}
      </svg>
    </div>
  );
};

export default BoulderImage;
