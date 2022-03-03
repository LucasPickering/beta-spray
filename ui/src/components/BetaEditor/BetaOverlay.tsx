import React, { useContext, useEffect } from "react";
import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import * as d3 from "d3";
import { BetaOverlay_betaNode$key } from "./__generated__/BetaOverlay_betaNode.graphql";
import OverlayContext from "context/OverlayContext";
import {
  distanceTo,
  D3Data,
  toD3Position,
  selector,
  D3DataError,
} from "util/d3";
import type { BaseType, DragBehavior } from "d3";
import classes from "./d3.scss";
import { BetaOverlay_createBetaMoveMutation } from "./__generated__/BetaOverlay_createBetaMoveMutation.graphql";

interface Props {
  dataKey: BetaOverlay_betaNode$key;
}

const snapRange = 5.0;

/**
 * Visualization of holds onto the boulder image
 */
const BetaOverlay: React.FC<Props> = ({ dataKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaOverlay_betaNode on BetaNode {
        id
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
        moves {
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

  // TODO use loading state
  const [createBetaMove] =
    useMutation<BetaOverlay_createBetaMoveMutation>(graphql`
      mutation BetaOverlay_createBetaMoveMutation(
        $input: CreateBetaMoveMutationInput!
      ) {
        createBetaMove(input: $input) {
          betaMove {
            id
          }
        }
      }
    `);

  // TODO de-dupe some of this logic into helper shit
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
      .on("end", function (event, betaMove) {
        if (betaMove.kind !== "betaMove") {
          throw new D3DataError("betaMove", betaMove);
        }

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
        if (snapTargets.length > 0) {
          const snapTarget =
            snapTargets[
              d3.minIndex(snapTargets, ([, distance]) => distance)
            ][0];
          d3.select(this)
            .attr("cx", snapTarget.position.x)
            .attr("cy", snapTarget.position.y);

          // Add a new move to the beta
          // Add this move as the next on in the beta
          const highestOrder = d3.max(
            beta.moves.edges.map(({ node }) => node.order)
          );
          // TODO revert move if this fails
          createBetaMove({
            variables: {
              input: {
                betaId: beta.id,
                order: highestOrder ? highestOrder + 1 : 0,
                bodyPart: betaMove.bodyPart,
                holdId:
                  snapTarget.kind === "hold" ? snapTarget.holdId : undefined,
              },
            },
          });
        } else {
          d3.select(this)
            .attr("cx", betaMove.position.x)
            .attr("cy", betaMove.position.y);
        }

        // Remove lingering styles
        d3.selectAll(selector(classes.snappableNear)).classed(
          classes.snappableNear,
          false
        );
      });

    // Add a circle for each beta move
    for (const { node } of beta.moves.edges) {
      // TODO figure out how to show non-hold moves
      if (!node.hold) {
        console.warn("skipping move (no associated hold)", node);
        continue;
      }

      const position = toD3Position(node.hold, aspectRatio);
      d3Svg
        .append("circle")
        .data<D3Data>([{ kind: "betaMove", position, ...node }])
        .attr("r", 2)
        .attr("cx", position.x)
        .attr("cy", position.y)
        .attr("fill", "blue")
        .call(circleDrag);
    }
  }, [aspectRatio, d3Svg, beta, createBetaMove]);

  return null;
};

export default BetaOverlay;
