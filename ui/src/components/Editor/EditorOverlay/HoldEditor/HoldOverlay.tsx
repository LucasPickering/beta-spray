import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import HoldMarker from "./HoldMarker";
import { HoldOverlay_holdConnection$key } from "./__generated__/HoldOverlay_holdConnection.graphql";

interface Props {
  holdConnectionKey: HoldOverlay_holdConnection$key;
  highlightedHolds?: string[];
  // TODO type alias?
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
}

/**
 * A dumb component that just renders holds onto an image.
 */
const HoldOverlay: React.FC<Props> = ({
  holdConnectionKey,
  highlightedHolds,
  onClick,
  onDoubleClick,
}) => {
  const holdConnection = useFragment(
    graphql`
      fragment HoldOverlay_holdConnection on HoldNodeConnection {
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
          highlight={highlightedHolds && highlightedHolds.includes(node.id)}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        />
      ))}
    </>
  );
};

export default HoldOverlay;
