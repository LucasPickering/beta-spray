/**
 * Utility functions related to beta moves.
 */

import {
  assertIsDefined,
  clamp,
  findNodeIndex,
  groupBy,
  isDefined,
  moveArrayElement,
} from "util/func";
import { hexToHtml, htmlToHex, lerpColor } from "util/math";
import { useTheme } from "@mui/material";
import { useCallback, useContext } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { disambiguationDistance } from "styles/svg";
import { moves_colors_betaMoveNodeConnection$key } from "./__generated__/moves_colors_betaMoveNodeConnection.graphql";
import { moves_visualPositions_betaMoveNodeConnection$key } from "./__generated__/moves_visualPositions_betaMoveNodeConnection.graphql";
import { BetaContext } from "./context";
import { BodyPart, OverlayPosition, add, polarToSvg } from "./svg";

/**
 * List of beta moves, from Relay, that we will update locally for the purpose
 * of optimistic updates.
 */
interface BetaMoves {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly id: string;
      readonly order: number;
      readonly isStart: boolean;
    };
  }>;
}

/**
 * Body parts sorted counter-clockwise, which follows the unit circle
 */
const bodyPartsCCW: BodyPart[] = [
  "RIGHT_HAND",
  "LEFT_HAND",
  "LEFT_FOOT",
  "RIGHT_FOOT",
];

/**
 * Get the color representing each beta move, which will be a linear
 * interpolation between two colors based on the ordering of the move within
 * the beta.
 *
 * @param betaMoveConnectionKey Relay fragment key for all beta moves
 * @returns Map of beta ID : color, to be passed to BetaContext
 */
export function useBetaMoveColors(
  betaMoveConnectionKey: moves_colors_betaMoveNodeConnection$key
): Map<string, string> {
  const betaMoveConnection = useFragment(
    graphql`
      fragment moves_colors_betaMoveNodeConnection on BetaMoveNodeConnection {
        edges {
          node {
            id
            order
          }
        }
      }
    `,
    betaMoveConnectionKey
  );

  const { palette } = useTheme();
  const moves = betaMoveConnection.edges;
  const startColor = htmlToHex(palette.editor.betaMoves.first.main);
  const endColor = htmlToHex(palette.editor.betaMoves.last.main);
  const colorMap: Map<string, string> = new Map();

  // Generate a color for each move
  for (const { node } of moves) {
    const hex = lerpColor(
      startColor,
      endColor,
      // Make sure we map first=>0, last=>1. Need to also prevent NaN
      moves.length > 1 ? (node.order - 1) / (moves.length - 1) : 0.0
    );
    colorMap.set(node.id, hexToHtml(hex));
  }

  return colorMap;
}

/**
 * Get the visual position for each move in a beta. For each move, this will
 * calculate some visual offset from its true position in order to make the beta
 * more legible. Specifically, this spreads apart moves on the same hold so they
 * can all be seen at once. These positions should be used for any rendering
 * purposes (so basically everywhere in the UI).
 *
 * @param betaMoveConnectionKey Relay fragment key for all beta moves
 * @returns Map of beta ID : visual position, to be passed to BetaContext
 */
export function useBetaMoveVisualPositions(
  betaMoveConnectionKey: moves_visualPositions_betaMoveNodeConnection$key
): Map<string, OverlayPosition> {
  const betaMoveConnection = useFragment(
    graphql`
      fragment moves_visualPositions_betaMoveNodeConnection on BetaMoveNodeConnection {
        edges {
          node {
            id
            bodyPart
            position @required(action: THROW)
            target {
              ... on HoldNode {
                id
              }
            }
          }
        }
      }
    `,
    betaMoveConnectionKey
  );

  const moves = betaMoveConnection.edges;
  const positionMap: Map<string, OverlayPosition> = new Map();

  // Start by just jamming every move into the map
  for (const { node } of moves) {
    positionMap.set(node.id, node.position);
  }

  // Next, we'll apply offsets to moves that share the same hold+body part, so
  // they don't sit on top of each other. The steps are:
  // 1. By body part, so left hand is top-left, right foot is bottom-right, etc.
  // 2. Spread evenly within that 90° slice (if multiple moves per body part)
  // So iterate over each move and set its visual offset accordingly

  const sliceSize = Math.PI / 2; // 90 degrees

  // Group by hold, then body part
  for (const movesByHold of groupBy(
    // Exclude free moves, since they'll never share the *exact* some position
    // Maybe we'll need a more dynamic disambiguation, but not yet
    moves.filter(({ node }) => isDefined(node.target.id)),
    ({ node }) => node.target.id
  ).values()) {
    const movesByBodyPart = groupBy(movesByHold, ({ node }) => node.bodyPart);

    bodyPartsCCW.forEach((bodyPart, i) => {
      const bodyPartMoves = movesByBodyPart.get(bodyPart);
      if (isDefined(bodyPartMoves)) {
        // The angle of the *start* of the slice
        const bodyPartAngle = sliceSize * i;

        // Break the slice into n+1 subslices, where n is number of moves on this
        // hold *for this body part*. We do +1 because we want them evenly spaced
        // between beginning and end, e.g. 1 move => 1/2 mark, 2 moves => 1/3 marks
        const subsliceSize = sliceSize / (bodyPartMoves.length + 1);

        // API wil pre-sort by order, and that ordering will persist here
        bodyPartMoves.forEach(({ node }, i) => {
          // If the move is attached to a hold, we want to apply spreading
          const offset = polarToSvg(
            disambiguationDistance,
            // i+1 so we don't start at the extreme edge
            bodyPartAngle + subsliceSize * (i + 1)
          );

          // Apply the offset to create the visual position
          const position = positionMap.get(node.id);
          // The map is fully populated above so this assertion is safe
          assertIsDefined(position);
          positionMap.set(node.id, add(position, offset));
        });
      }
    });
  }

  return positionMap;
}

/**
 * A hook for accessing the color of each move in the beta. This returns a
 * getter than can then provide each move's color, so that you can easily
 * handle multiple moves within one component. Relies on BetaContext being
 * present and the colors being initialized within that context.
 *
 * @returns A function that takes in a move ID and returns its color
 */
export function useBetaMoveColor(): (betaMoveId: string) => string {
  const { betaMoveColors } = useContext(BetaContext);
  return useCallback(
    (betaMoveId) => {
      const color = betaMoveColors.get(betaMoveId);
      if (!isDefined(color)) {
        // eslint-disable-next-line no-console
        console.warn(
          `No color for beta move ${betaMoveId}. Either the ID is unknown or` +
            ` color wasn't initialized in this part of the component tree.`
        );
        return "#000000";
      }
      return color;
    },
    [betaMoveColors]
  );
}

/**
 * A hook for accessing the visual position of each move in the beta. This
 * returns a getter than can then provide each move's position, so that you can
 * easily handle multiple moves within one component. Relies on BetaContext
 * being present and the visual positions being initialized within that context.
 *
 * @returns A function that takes in a move ID and returns its position
 */
export function useBetaMoveVisualPosition(): (
  betaMoveId: string
) => OverlayPosition {
  const { betaMoveVisualPositions } = useContext(BetaContext);
  return useCallback(
    (betaMoveId) => {
      const visualPosition = betaMoveVisualPositions.get(betaMoveId);
      if (!isDefined(visualPosition)) {
        throw new Error(
          `No visual position for beta move ${betaMoveId}. Either the ID is unknown or` +
            ` positions weren't initialized in this part of the component tree.`
        );
      }
      return visualPosition;
    },
    [betaMoveVisualPositions]
  );
}

/**
 * Insert a new move into a beta. For optimistic responses only.
 * @param moves List of moves to insert into
 * @param betaMoveId ID of the new move
 * @param newOrder Order of the new move
 * @returns A *new* array, with the new move inserted
 */
export function createBetaMoveLocal(
  moves: BetaMoves,
  betaMoveId: string,
  newOrder: number
): BetaMoves {
  const newIndex = clamp(newOrder - 1, 0, moves.edges.length);

  return {
    edges: [
      ...moves.edges.slice(0, newIndex),
      // We intentionally don't calculate isStart, it's just not worth it
      { node: { id: betaMoveId, order: newIndex + 1, isStart: false } },
      // +1 to the order for everything shifted down
      ...moves.edges.slice(newIndex).map(({ node: { order, ...rest } }) => ({
        node: { order: order + 1, ...rest },
      })),
    ],
  };
}

/**
 * Reorder a beta move in a beta. For optimistic responses only.
 * @param moves List of moves to reorder in
 * @param betaMoveId ID of the move to reorder
 * @param newOrder New order value for the given move
 * @returns A *new* array, with the specified move reordered and all moves'
 *  orders adjusted accordingly. *Unless*, if the given ID isn't in the
 *  connection, the same input object is returned.
 */
export function reorderBetaMoveLocal(
  moves: BetaMoves,
  betaMoveId: string,
  newOrder: number
): BetaMoves {
  const oldIndex = findNodeIndex(moves, betaMoveId);

  if (oldIndex >= 0) {
    const newIndex = clamp(newOrder - 1, 0, moves.edges.length);
    const edges = [...moves.edges];
    moveArrayElement(edges, oldIndex, newIndex);
    return {
      edges: edges.map(({ node: { id, isStart } }, i) => ({
        // We intentionally don't recalculate isStart, it's just not worth it
        node: { id, isStart, order: i + 1 },
      })),
    };
  } else {
    // Move wasn't found - don't do anything. No point in copying here
    // because the input is readonly
    return moves;
  }
}
