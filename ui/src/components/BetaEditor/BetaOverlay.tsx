import React, { useContext, useEffect } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import * as d3 from "d3";
import { BetaOverlay_betaNode$key } from "./__generated__/BetaOverlay_betaNode.graphql";
import OverlayContext from "context/OverlayContext";
import { distanceTo, D3Data, toD3Position, selector } from "util/d3";
import type { BaseType, DragBehavior } from "d3";
import classes from "./d3.scss";

interface Props {
  dataKey: BetaOverlay_betaNode$key;
}

const snapRange = 5.0;

/**
 * Visualization of holds onto the boulder image
 */
const BetaOverlay: React.FC<Props> = ({ dataKey }) => {
  const data = useFragment(
    graphql`
      fragment BetaOverlay_betaNode on BetaNode {
        problem {
          holds {
            edges {
              node {
                positionX
                positionY
              }
            }
          }
        }
        holds {
          edges {
            node {
              id
              bodyPart
              order
              hold {
                positionX
                positionY
              }
            }
          }
        }
      }
    `,
    dataKey
  );

  const { aspectRatio, d3Svg } = useContext(OverlayContext);

  useEffect(() => {
    // Drag handler
    const circleDrag: DragBehavior<SVGCircleElement, D3Data, unknown> = d3
      .drag<SVGCircleElement, D3Data>()
      .on("drag", function (event) {
        // Move element to follow drag
        d3.select(this).raise().attr("cx", event.x).attr("cy", event.y);

        // Highlight potential snap targets
        d3.selectAll<BaseType, D3Data>(selector(classes.snappable)).classed(
          classes.snappableNear,
          (d) => distanceTo({ x: event.x, y: event.y }, d.position) <= snapRange
        );
      })
      .on("end", function (event, betaHold) {
        // Get a list of tuples of [snap target, distance to target], but only
        // include ones within our snap range
        const snapTargets = d3
          .selectAll<BaseType, D3Data>(selector(classes.snappable))
          .data()
          .map<[D3Data, number]>((d) => [
            d,
            distanceTo({ x: event.x, y: event.y }, d.position),
          ])
          .filter(([, distance]) => distance <= snapRange);

        // Snap to the nearest target, if any, otherwise back to the start
        const snapPosition =
          snapTargets.length > 0
            ? snapTargets[
                d3.minIndex(snapTargets, ([, distance]) => distance)
              ][0].position
            : betaHold.position;
        d3.select(this).attr("cx", snapPosition.x).attr("cy", snapPosition.y);

        // Remove lingering styles
        d3.selectAll(selector(classes.snappableNear)).classed(
          classes.snappableNear,
          false
        );
      });

    // Add a circle for each beta move
    for (const { node } of data.holds.edges) {
      const position = toD3Position(node.hold, aspectRatio);
      d3Svg
        .append("circle")
        .data<D3Data>([{ kind: "betaHold", position, betaHoldId: node.id }])
        .attr("r", 2)
        .attr("cx", position.x)
        .attr("cy", position.y)
        .attr("fill", "blue")
        .call(circleDrag);
    }
  }, [aspectRatio, d3Svg, data.holds.edges]);

  return null;
};

export default BetaOverlay;
