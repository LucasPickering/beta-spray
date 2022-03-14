import React from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import HoldMark from "./HoldMark";
import { HoldOverlay_holdConnection$key } from "./__generated__/HoldOverlay_holdConnection.graphql";

interface Props
  extends Pick<
    React.ComponentProps<typeof HoldMark>,
    "onClick" | "onDoubleClick" | "onDrop"
  > {
  holdConnectionKey: HoldOverlay_holdConnection$key;
}

/**
 * A dumb component that just renders holds onto an image.
 */
const HoldOverlay: React.FC<Props> = ({
  holdConnectionKey,
  onClick,
  onDoubleClick,
  onDrop,
}) => {
  const holdConnection = useFragment(
    graphql`
      fragment HoldOverlay_holdConnection on HoldNodeConnection {
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
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onDrop={onDrop}
        />
      ))}
    </>
  );
};

export default HoldOverlay;
