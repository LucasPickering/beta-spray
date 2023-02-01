import React, { useCallback, useEffect } from "react";
import { useContext } from "react";
import { useFragment } from "react-relay";
import { graphql } from "relay-runtime";
import { findNodeIndex, isDefined, last, noop } from "util/func";
import { StateContext } from "./context";
import { Stance } from "./svg";
import {
  stance_betaMoveNodeConnection$data,
  stance_betaMoveNodeConnection$key,
} from "./__generated__/stance_betaMoveNodeConnection.graphql";

/**
 * State defining the current stance (which is reflect by the stick figure).
 * We store the state as a single ID, representing the *most recent* (i.e.
 * highest order) move in the stance. To retrieve the rest of the stance, we
 * look at the most recent move for each body part *before* the stance move.
 * This will be undefined iff the beta is empty.
 */
const StanceContext = React.createContext<StateContext<string | undefined>>([
  undefined,
  noop,
]);

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
  const [stanceMoveId, setStanceMoveId] = useContext(StanceContext);

  // We need to do some normalization on the selected stance move. There are a
  // few scenarios where an invalid move can be selected for the stance:
  // - Reodering moves causes the stance move to be *before* the first selectable one
  // - Selected move got deleted
  // We handle both these cases by comparing the index of the selected move to
  // the first selectable move (i.e. the final *start* move), and taking the
  // later of the two (since nothing before the start is valid, including -1)
  const firstSelectableIndex = getFirstSelectableIndex(betaMoveConnection);
  // This will be -1 if the ID is no longer in the list (it got deleted)
  const stanceMoveIndexSketchy = stanceMoveId
    ? findNodeIndex(betaMoveConnection, stanceMoveId)
    : -1;
  const stanceMoveIndex = Math.max(
    firstSelectableIndex,
    stanceMoveIndexSketchy
  );
  // If the move list is empty, then stanceMoveIndex will be -1 here

  // Update stance state to match the normalization we just did. This makes sure
  // the controls state stays in sync with what we've established here.
  useEffect(() => {
    if (stanceMoveIndexSketchy !== stanceMoveIndex) {
      setStanceMoveId(
        stanceMoveIndex >= 0
          ? betaMoveConnection.edges[stanceMoveIndex].node.id
          : undefined
      );
    }
  }, [
    betaMoveConnection,
    setStanceMoveId,
    stanceMoveIndexSketchy,
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
   * Select a stance by move ID. This should only be used for absolute updates,
   * e.g. after adding a move, and not for relative steps.
   */
  select(betaMoveId: string): void;
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
  const [stanceMoveId, setStanceMoveId] = useContext(StanceContext);

  const firstMoveId = getFirstSelectableMove(betaMoveConnection);
  const lastMoveId = last(betaMoveConnection.edges)?.node.id;

  const hasPrevious = isDefined(stanceMoveId) && stanceMoveId !== firstMoveId;
  const hasNext = isDefined(stanceMoveId) && stanceMoveId !== lastMoveId;

  const step = useCallback(
    (steps: number) => {
      setStanceMoveId((prev) => {
        if (!isDefined(prev)) {
          return undefined;
        }
        const prevIndex = findNodeIndex(betaMoveConnection, prev);
        const newIndex = prevIndex + steps;

        // This shouldn't be called when a step isn't possible, so let's log it
        if (newIndex < 0 || newIndex > betaMoveConnection.edges.length) {
          // eslint-disable-next-line no-console
          console.warn(
            `Attempted to step ${steps} moves in stance when not possible`
          );
          return prev;
        }

        return betaMoveConnection.edges[newIndex].node.id;
      });
    },
    [betaMoveConnection, setStanceMoveId]
  );
  const selectPrevious = useCallback(() => step(-1), [step]);
  const selectNext = useCallback(() => step(1), [step]);
  const selectFirst = useCallback(
    () => setStanceMoveId(firstMoveId),
    // firstMoveId should only change when the beta is edited
    [firstMoveId, setStanceMoveId]
  );
  const selectLast = useCallback(
    () => setStanceMoveId(lastMoveId),
    // lastMoveId should only change when the beta is edited
    [lastMoveId, setStanceMoveId]
  );

  return {
    hasPrevious,
    hasNext,
    select: setStanceMoveId,
    selectPrevious,
    selectNext,
    selectFirst,
    selectLast,
  };
}

/**
 * Get the first move in the beta that can be selected as a "stance move". This
 * is the last *start* move in the beta. Selecting any moves before the final
 * start move is pointless, since selecting any start move results in the stance
 * just being the start stance.
 */
function getFirstSelectableMove(
  betaMoveConnection: stance_betaMoveNodeConnection$data
): string | undefined {
  const index = getFirstSelectableIndex(betaMoveConnection);
  return index >= 0 ? betaMoveConnection.edges[0].node.id : undefined;
}

/**
 * Get the *index* of the first move in the beta that can be selected for
 * a stance.
 */
function getFirstSelectableIndex(
  betaMoveConnection: stance_betaMoveNodeConnection$data
): number {
  return betaMoveConnection.edges.findLastIndex(({ node }) => node.isStart);
}
