import { clamp, noop } from "util/func";
import { hexToHtml, averageColors, htmlToHex } from "util/math";
import React, { useCallback, useEffect } from "react";
import { useContext } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { StateContext } from "./context";
import { useBetaMoveColor } from "./moves";
import { Stance } from "./svg";
import {
  stance_betaMoveNodeConnection$data,
  stance_betaMoveNodeConnection$key,
} from "./__generated__/stance_betaMoveNodeConnection.graphql";

/**
 * State defining the current stance (which is reflect by the stick figure).
 * We store the state as a move *index* (NOT order), representing the *most
 * recent* (i.e. highest order) move in the stance. To retrieve the rest of the
 * stance, we look at the most recent move for each body part *before* the
 * stance move. This will be -1 iff the beta is empty.
 *
 * This stores index instead of ID for two reasons:
 *  - Roll forward to the next move if the stance move is deleted
 *  - Optimistically update stance when move is added
 *    - We don't know the new ID until after the response, but we know the new
 *      order ahead of time
 */
const StanceContext = React.createContext<StateContext<number>>([-1, noop]);

/**
 * Only export the provider. We want to restrict all read access to go through
 * the hooks below.
 */
export const StanceContextProvider = StanceContext.Provider;

const betaMoveNodeConnectionFragment = graphql`
  fragment stance_betaMoveNodeConnection on BetaMoveNodeConnection {
    edges {
      node {
        id
        bodyPart
        isStart
      }
    }
  }
`;

/**
 * Get the list of moves in the current body stance (AKA body position).
 *
 * @returns A mapping of IDs of the moves in the current body position, keyed by
 *  body part. The map will be empty iff there are no moves in the beta.
 */
export function useStance(
  betaMoveConnectionKey: stance_betaMoveNodeConnection$key
): Partial<Stance> {
  const betaMoveConnection = useFragment(
    betaMoveNodeConnectionFragment,
    betaMoveConnectionKey
  );

  // A stance is defined by a single move, which is the *last* move in the
  // stance (generally speaking)
  const [stanceMoveIndexSketchy, setStanceMoveIndex] =
    useContext(StanceContext);

  // We need to do some normalization on the selected stance move. There are a
  // few scenarios where an invalid move can be selected for the stance:
  // - Reodering moves causes the stance move to be *before* the first selectable one
  // - Selected move got deleted
  // - Switched betas
  // We handle both these cases by comparing the index of the selected move to
  // the first selectable move (i.e. the final *start* move), and taking the
  // later of the two (since nothing before the start is valid, including -1)
  const firstSelectableIndex = getFirstSelectableIndex(betaMoveConnection);
  const lastSelectableIndex = getLastSelectableIndex(betaMoveConnection);
  // This will be -1 iff the beta is empty
  const stanceMoveIndex = clamp(
    stanceMoveIndexSketchy,
    firstSelectableIndex,
    lastSelectableIndex
  );
  // If the move list is empty, then stanceMoveIndex will be -1 here

  // Update stance state to match the normalization we just did. This makes sure
  // the controls state stays in sync with what we've established here.
  const stanceInSync = stanceMoveIndexSketchy === stanceMoveIndex;
  useEffect(() => {
    if (!stanceInSync) {
      setStanceMoveIndex(stanceMoveIndex);
    }
  }, [
    betaMoveConnection.edges,
    setStanceMoveIndex,
    stanceInSync,
    stanceMoveIndex,
  ]);

  // Find the most recent position of each body part at the point of the
  // stance move. Moves should always be sorted by order! If there's no stance,
  // then the index will be -1, so the slice is empty.
  return betaMoveConnection.edges
    .slice(0, stanceMoveIndex + 1)
    .reduce<Partial<Stance>>((acc, { node }) => {
      acc[node.bodyPart] = node.id;
      return acc;
    }, {});
}

/**
 * Get the last move in the current stance.
 * @returns ID of the move in the current stance with the highest order, or
 * `undefined` if there is no current stance
 */
export function useLastMoveInStance(
  betaMoveConnectionKey: stance_betaMoveNodeConnection$key
): string | undefined {
  const betaMoveConnection = useFragment(
    betaMoveNodeConnectionFragment,
    betaMoveConnectionKey
  );
  const [stanceMoveIndex] = useContext(StanceContext);
  return betaMoveConnection.edges[stanceMoveIndex]?.node.id;
}

/**
 * Get the color of the stick figure, which is the average of the colors of
 * each move in the stance.
 * @param stance Current stance (from useStance)
 * @returns The current stick figure color (defaults to white)
 */
export function useStickFigureColor(stance: Partial<Stance>): string {
  const getBetaMoveColor = useBetaMoveColor();
  const moves = Object.values(stance);
  return moves.length === 0
    ? "#ffffff"
    : hexToHtml(
        averageColors(
          moves.map((betaMoveId) => htmlToHex(getBetaMoveColor(betaMoveId)))
        )
      );
}

/**
 * Controls for modifying the current stance
 */
export interface StanceControls {
  /**
   * Is there a stance before the current one? I.e. can we step backwards?
   */
  hasPrevious: boolean;
  /**
   * Is there a stance after the current one? I.e. can we step forwards?
   */
  hasNext: boolean;
  /**
   * Select a stance by move order. This should only be used for absolute updates,
   * e.g. after adding a move, and not for relative steps.
   *
   * See {@link StanceContext} for why we accept order, not ID.
   */
  select(order: number): void;
  /**
   * Select the first stance in the beta
   */
  selectFirst(): void;
  /**
   * Select the last stance in the beta
   */
  selectLast(): void;
  /**
   * Select the stance immediately before the current one. Does nothing if the
   * first stance is already selected.
   */
  selectPrevious(): void;
  /**
   * Select the stance immediate after the current one. Does nothing if the
   * last stance is already selected.
   */
  selectNext(): void;
  /**
   * Reset stance to undefined. Should be called whenever changing between betas.
   */
  reset(): void;
}

/**
 * Get controls for modifying the stance
 * @returns See StanceControls
 */
export function useStanceControls(
  betaMoveConnectionKey: stance_betaMoveNodeConnection$key
): StanceControls {
  const betaMoveConnection = useFragment(
    betaMoveNodeConnectionFragment,
    betaMoveConnectionKey
  );
  const [stanceMoveIndex, setStanceMoveIndex] = useContext(StanceContext);

  const firstMoveIndex = getFirstSelectableIndex(betaMoveConnection);
  const lastMoveIndex = getLastSelectableIndex(betaMoveConnection);

  const hasPrevious = stanceMoveIndex > firstMoveIndex;
  const hasNext = stanceMoveIndex < lastMoveIndex;

  const select = useCallback(
    (order: number) => {
      setStanceMoveIndex(order - 1);
    },
    [setStanceMoveIndex]
  );
  const step = useCallback(
    (steps: number) => {
      setStanceMoveIndex((prevIndex) => {
        const newIndex = prevIndex + steps;

        // This shouldn't be called when a step isn't possible, so let's log it
        if (newIndex < firstMoveIndex || newIndex > lastMoveIndex) {
          // eslint-disable-next-line no-console
          console.warn(
            `Attempted to step ${steps} moves in stance when not possible`
          );
          return prevIndex;
        }

        return newIndex;
      });
    },
    [firstMoveIndex, lastMoveIndex, setStanceMoveIndex]
  );
  const selectPrevious = useCallback(() => step(-1), [step]);
  const selectNext = useCallback(() => step(1), [step]);
  const selectFirst = useCallback(
    () => setStanceMoveIndex(firstMoveIndex),
    // firstMoveId should only change when the beta is edited
    [firstMoveIndex, setStanceMoveIndex]
  );
  const selectLast = useCallback(
    () => setStanceMoveIndex(lastMoveIndex),
    // lastMoveId should only change when the beta is edited
    [lastMoveIndex, setStanceMoveIndex]
  );
  const reset = useCallback(() => setStanceMoveIndex(-1), [setStanceMoveIndex]);

  return {
    hasPrevious,
    hasNext,
    select,
    selectPrevious,
    selectNext,
    selectFirst,
    selectLast,
    reset,
  };
}

/**
 * Get the index of the first move in the beta that can be selected for
 * a stance.
 */
function getFirstSelectableIndex(
  betaMoveConnection: stance_betaMoveNodeConnection$data
): number {
  return betaMoveConnection.edges.findLastIndex(({ node }) => node.isStart);
}

/**
 * Get the index of the last move in the beta that can be selected for
 * a stance.
 */
function getLastSelectableIndex(
  betaMoveConnection: stance_betaMoveNodeConnection$data
): number {
  return betaMoveConnection.edges.length - 1;
}
