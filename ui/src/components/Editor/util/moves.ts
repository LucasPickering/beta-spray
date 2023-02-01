/**
 * Utility functions related to beta moves.
 */

import { findNodeIndex, moveArrayElement } from "../../../util/func";

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
      ({ node: { id, isStart } }, i) => ({
        // We intentionally don't recalculate isStart, it's just not worth it
        node: { id, isStart, order: i + 1 },
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
      .map(({ node: { id, isStart } }, i) => ({
        // We intentionally don't recalculate isStart, it's just not worth it.
        // This does lead to some flickering issues, maybe we could do it in
        // the future?
        node: { id, isStart, order: i + 1 },
      })),
  };
}
