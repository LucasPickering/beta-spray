import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import HoldMark from "./HoldMark";
import { HoldMarks_holdConnection$key } from "./__generated__/HoldMarks_holdConnection.graphql";

interface Props {
  holdConnectionKey: HoldMarks_holdConnection$key;
  highlightedHolds?: string[];
  onClick?: (holdId: string) => void;
  onDoubleClick?: (holdId: string) => void;
}

/**
 * A dumb component that just renders holds onto an image.
 */
const HoldMarks: React.FC<Props> = ({
  holdConnectionKey,
  highlightedHolds,
  onClick,
  onDoubleClick,
}) => {
  const holdConnection = useFragment(
    graphql`
      fragment HoldMarks_holdConnection on HoldNodeConnection {
        edges {
          node {
            id
            ...HoldMark_holdNode
          }
        }
      }
    `,
    holdConnectionKey
  );

  return (
    <>
      {holdConnection.edges.map(({ node }) => (
        <HoldMark
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

export default HoldMarks;
