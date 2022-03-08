import OverlayContext from "context/OverlayContext";
import React, { useContext } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { toOverlayPosition } from "util/func";
import HoldMarker from "./HoldMarker";
import { HoldOverlay_holdConnection$key } from "./__generated__/HoldOverlay_holdConnection.graphql";

interface Props {
  dataKey: HoldOverlay_holdConnection$key;
}

/**
 * Visualization of holds onto the boulder image
 */
const HoldOverlay: React.FC<Props> = ({ dataKey }) => {
  const holdConnection = useFragment(
    graphql`
      fragment HoldOverlay_holdConnection on HoldNodeConnection {
        edges {
          node {
            id
            positionX
            positionY
          }
        }
      }
    `,
    dataKey
  );

  const { aspectRatio } = useContext(OverlayContext);

  return (
    <>
      {holdConnection.edges.map(({ node }) => {
        const position = toOverlayPosition(node, aspectRatio);
        return (
          <HoldMarker key={node.id} holdId={node.id} position={position} />
        );
      })}
    </>
  );
};

export default HoldOverlay;
