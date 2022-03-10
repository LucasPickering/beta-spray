import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import HoldMarker from "./HoldMarker";
import { HoldMarkers_holdConnection$key } from "./__generated__/HoldMarkers_holdConnection.graphql";

interface Props {
  holdConnectionKey: HoldMarkers_holdConnection$key;
  highlightedHolds?: string[];
  // TODO type alias?
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
}

/**
 * A dumb component that just renders holds onto an image.
 */
const HoldMarkers: React.FC<Props> = ({
  holdConnectionKey,
  highlightedHolds,
  onClick,
  onDoubleClick,
}) => {
  const holdConnection = useFragment(
    graphql`
      fragment HoldMarkers_holdConnection on HoldNodeConnection {
        edges {
          node {
            id
            ...HoldMarker_holdNode
          }
        }
      }
    `,
    holdConnectionKey
  );

  return (
    <>
      {holdConnection.edges.map(({ node }) => (
        <HoldMarker
          key={node.id}
          holdKey={node}
          unhighlight={highlightedHolds && !highlightedHolds.includes(node.id)}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      ))}
    </>
  );
};

export default HoldMarkers;
