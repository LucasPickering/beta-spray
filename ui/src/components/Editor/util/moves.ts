/**
 * Utility functions related to beta moves.
 */

import {
  assertIsDefined,
  findNodeIndex,
  groupBy,
  isDefined,
  moveArrayElement,
} from "util/func";
import { hexToHtml, htmlToHex, lerpColor } from "util/math";
import theme from "util/theme";
import { disambiguationDistance } from "styles/svg";
import { add, BodyPart, OverlayPosition, polarToSvg } from "./svg";

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
      readonly isLastInChain: boolean;
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
 * Get the color pair representing each beta move. The primary color will be a
 * linear interpolation between two colors based on the ordering of the move
 * within the beta. The secondary color expresses further metadata.
 *
 * @param move All moves in the beta (from Relay)
 * @returns Map of beta ID : color pair, to be passed to BetaContext
 */
export function getBetaMoveColors(
  moves: Array<{ id: string; order: number; isStart: boolean }>
): Map<string, string> {
  const startColor = htmlToHex(theme.palette.primary.main);
  const endColor = htmlToHex(theme.palette.secondary.main);
  const colorMap: Map<string, string> = new Map();

  // Generate a color for each move
  for (const move of moves) {
    const hex = lerpColor(
      startColor,
      endColor,
      // Make sure we map first=>0, last=>1. Need to also prevent NaN
      moves.length > 1 ? (move.order - 1) / (moves.length - 1) : 0.0
    );
    colorMap.set(move.id, hexToHtml(hex));
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
 * @param moves All moves in the beta (from Relay). Readonly because mutating
 *  Relay state is a nono.
 * @returns Map of beta ID : visual position, to be passed to BetaContext
 */
export function getBetaMoveVisualPositions(
  moves: ReadonlyArray<{
    readonly id: string;
    readonly bodyPart: BodyPart;
    readonly hold: { id: string; position: OverlayPosition } | null;
    readonly position: OverlayPosition | null;
  }>
): Map<string, OverlayPosition> {
  const positionMap: Map<string, OverlayPosition> = new Map();

  // Start by just jamming every move into the map
  for (const move of moves) {
    // Grab position from either the hold (for attached moves) or the move
    // itself (for free moves)
    const position = move.position ?? move.hold?.position;
    if (position) {
      positionMap.set(move.id, position);
    } else {
      // eslint-disable-next-line no-console
      console.warn("No position available for move:", move);
    }
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
    moves.filter((move) => isDefined(move.hold)),
    (move) => move.hold?.id
  ).values()) {
    const movesByBodyPart = groupBy(movesByHold, (move) => move.bodyPart);

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
        bodyPartMoves.forEach((move, i) => {
          // If the move is attached to a hold, we want to apply spreading
          const offset = polarToSvg(
            disambiguationDistance,
            // i+1 so we don't start at the extreme edge
            bodyPartAngle + subsliceSize * (i + 1)
          );

          // Apply the offset to create the visual position
          const position = positionMap.get(move.id);
          // The map is fully populated above so this assertion is safe
          assertIsDefined(position);
          positionMap.set(move.id, add(position, offset));
        });
      }
    });
  }

  return positionMap;
}

/**
 * Reorder a beta move in a beta. For optimistic responses only.
 * @param moves List of moves to reorder in
 * @param betaMoveId ID of the move to reorder
 * @param newOrder New order value for the given move
 * @returns A *new* array, with the specified move reordered and all moves'
 *  orders adjusted accordingly
 */
export function reorderBetaMoveLocal(
  moves: BetaMoves,
  betaMoveId: string,
  newOrder: number
): BetaMoves {
  const oldIndex = findNodeIndex(moves, betaMoveId);
  const newIndex = newOrder - 1;
  return {
    edges: moveArrayElement(moves.edges, oldIndex, newIndex).map(
      ({ node: { id, isStart, isLastInChain } }, i) => ({
        // We intentionally don't recalculate isStart and isLastInChain, it's just not worth it
        node: { id, isStart, isLastInChain, order: i + 1 },
      })
    ),
  };
}

/**
 * Delete a beta move from a list of moves. For optimistic responses only.
 * @param moves List of moves to remove from
 * @param betaMoveId ID of the move to delete
 * @returns A *new* array, with the specified move removed and other moves'
 *  orders adjusted accordingly
 */
export function deleteBetaMoveLocal(
  moves: BetaMoves,
  betaMoveId: string
): BetaMoves {
  return {
    edges: moves.edges
      .filter(({ node: { id } }) => id !== betaMoveId)
      .map(({ node: { id, isStart, isLastInChain } }, i) => ({
        // We intentionally don't recalculate isStart and isLastInChain, it's just not worth it.
        // This does lead to some flickering issues, maybe we could do it in
        // the future?
        node: { id, isStart, isLastInChain, order: i + 1 },
      })),
  };
}
