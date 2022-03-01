import OverlayContext from "context/OverlayContext";
import React, { useContext, useEffect } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { D3Data, toD3Position } from "util/d3";
import { HoldOverlay_holdConnection$key } from "./__generated__/HoldOverlay_holdConnection.graphql";
import classes from "./d3.scss";

interface Props {
  dataKey: HoldOverlay_holdConnection$key;
}

/**
 * Visualization of holds onto the boulder image
 */
const HoldOverlay: React.FC<Props> = ({ dataKey }) => {
  const data = useFragment(
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

  const { aspectRatio, d3Svg } = useContext(OverlayContext);

  // D3 stuff
  useEffect(() => {
    for (const { node } of data.edges) {
      const position = toD3Position(node, aspectRatio);
      d3Svg
        .append("circle")
        .data<D3Data>([{ kind: "hold", position, holdId: node.id }])
        .classed(classes.hold, true)
        .classed(classes.snappable, true)
        .attr("r", 2)
        .attr("cx", position.x)
        .attr("cy", position.y)
        // Important for scaling
        .attr("transform-origin", `${position.x} ${position.y}`);
    }
  }, [aspectRatio, d3Svg, data.edges]);

  return null;
};

export default HoldOverlay;
