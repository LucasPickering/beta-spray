import React, { useCallback } from "react";
import { useContext, useMemo } from "react";
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
  const [stanceMoveId] = useContext(StanceContext);

  return useMemo(() => {
    // If there isn't a stance move, then there's no current stance
    if (!isDefined(stanceMoveId)) {
      return {};
    }

    // Find the most recent position of each body part at the point of the
    // stance move. Moves should always be sorted by order!
    const stanceMoveIndex = findNodeIndex(betaMoveConnection, stanceMoveId);
    return betaMoveConnection.edges
      .slice(0, stanceMoveIndex + 1)
      .reduce<Partial<Stance>>((acc, { node }) => {
        acc[node.bodyPart] = node.id;
        return acc;
      }, {});
  }, [betaMoveConnection, stanceMoveId]);
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
  return betaMoveConnection.edges.findLast(({ node }) => node.isStart)?.node.id;
}