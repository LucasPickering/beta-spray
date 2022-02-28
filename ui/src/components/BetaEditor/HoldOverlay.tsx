import React, { useEffect, useRef } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import * as d3 from "d3";
import { HoldOverlay_holdConnection$key } from "./__generated__/HoldOverlay_holdConnection.graphql";

interface Props {
  holdConnectionKey: HoldOverlay_holdConnection$key;
  aspectRatio: number;
}

const HoldOverlay: React.FC<Props> = ({ holdConnectionKey, aspectRatio }) => {
  const data = useFragment(
    graphql`
      fragment HoldOverlay_holdConnection on HoldNodeConnection {
        edges {
          node {
            positionX
            positionY
          }
        }
      }
    `,
    holdConnectionKey
  );

  const svgRef = useRef<SVGSVGElement>(null);

  // D3 stuff
  useEffect(() => {
    // Don't render anything until the background image loads
    if (aspectRatio === undefined) {
      return;
    }

    const svgEl = d3.select(svgRef.current);
    const svg = svgEl.append("g");

    for (const { node } of data.edges) {
      svg
        .append("circle")
        .attr("r", 1)
        .attr("cx", node.positionX * 100)
        .attr("cy", (node.positionY * 100) / aspectRatio)
        .attr("fill", "red");
    }
  }, [data.edges, aspectRatio]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 100 ${100 / aspectRatio}`}
      width="100%"
      height="100%"
      style={{
        // Overlay on top of the background image
        position: "absolute",
        top: 0,
        left: 0,
      }}
    />
  );
};

export default HoldOverlay;
