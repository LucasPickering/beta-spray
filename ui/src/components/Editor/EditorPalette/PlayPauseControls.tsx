import { Tooltip, IconButton } from "@mui/material";
import {
  PlayArrow as IconPlayArrow,
  Pause as IconPause,
  KeyboardArrowLeft as IconKeyboardArrowLeft,
  KeyboardArrowRight as IconKeyboardArrowRight,
  Replay as IconReplay,
} from "@mui/icons-material";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { withQuery } from "relay-query-wrapper";
import { betaQuery } from "../queries";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import { PlayPauseControls_betaNode$key } from "./__generated__/PlayPauseControls_betaNode.graphql";
import { EditorVisibilityContext } from "components/Editor/util/context";
import { isDefined } from "util/func";
import { useHighlight } from "components/Editor/util/highlight";

/**
 * Length of time (in milliseconds) between steps while playing moves.
 */
const stepIntervalMs = 1000;

interface Props {
  betaKey: PlayPauseControls_betaNode$key;
}

/**
 * Controls for stepping through a beta move-by-move. Provides buttons to step
 * forward and back one move at a time, as well as a play/pause feature to step
 * automatically at a fixed interval.
 *
 * This needs access to the full list of move IDs for the beta, hence the
 * need for the beta from Relay.
 */
const PlayPauseControls: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment PlayPauseControls_betaNode on BetaNode {
        moves {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    betaKey
  );
  const [visibility] = useContext(EditorVisibilityContext);
  // Play/pause handler needs the list of move IDs so it knows how to walk
  // through them
  const moveIds = useMemo(
    () => beta.moves.edges.map(({ node }) => node.id),
    [beta.moves.edges]
  );

  const [highlightedMoveId, highlightMove] = useHighlight("move");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlayPause = useCallback(() => setIsPlaying((prev) => !prev), []);
  // Step forward (positive) or back (negative) some arbitrary number of moves
  const step = useCallback(
    (steps: number) => {
      highlightMove((prev) => {
        // Stepping forward => start at the beginning
        // Stepping backward => start at the end
        const defaultIndex = steps > 0 ? 0 : moveIds.length - 1;
        const nextHighlightedIndex = isDefined(prev)
          ? moveIds.indexOf(prev) + steps
          : defaultIndex;
        return 0 <= nextHighlightedIndex &&
          nextHighlightedIndex < moveIds.length
          ? moveIds[nextHighlightedIndex]
          : // We've reached the end, just leave the last move highlighted
            prev;
      });
    },
    [moveIds, highlightMove]
  );

  // The behavior of the stepper buttons changes if we're at the beginning/end
  // of the beta. isDefined checks are necessary to prevent false positives when
  // moveIds is empty.
  const isFirstMove =
    isDefined(highlightedMoveId) && highlightedMoveId === moveIds[0];
  const isLastMove =
    isDefined(highlightedMoveId) &&
    highlightedMoveId === moveIds[moveIds.length - 1];

  // When playing is enabled, trigger an interval to step through the moves.
  // Interval will cancel itself when play state changes.
  useEffect(() => {
    if (isPlaying) {
      step(1); // Make first step immediately
      const intervalID = setInterval(() => step(1), stepIntervalMs);
      return () => clearInterval(intervalID);
    }
  }, [isPlaying, step]);

  // When we reach the last highlighted move, stop playing
  useEffect(() => {
    if (isLastMove) {
      setIsPlaying(false);
    }
  }, [isLastMove]);

  return (
    <PlayPauseControlsContent
      // Disable buttons while the overlay is disabled
      disabled={!visibility || moveIds.length === 0}
      isPlaying={isPlaying}
      isFirstMove={isFirstMove}
      isLastMove={isLastMove}
      togglePlayPause={togglePlayPause}
      // If at the first move, we can't step back so jump to the end. Vice
      // versa for stepNext
      stepPrev={() => step(isFirstMove ? moveIds.length - 1 : -1)}
      stepNext={() => step(isLastMove ? -(moveIds.length - 1) : 1)}
    />
  );
};

/**
 * A dumb helper component to render the buttons. This makes it easy to render
 * placeholder buttons when no beta is available.
 */
const PlayPauseControlsContent: React.FC<{
  disabled?: boolean;
  isPlaying?: boolean;
  isFirstMove?: boolean;
  isLastMove?: boolean;
  togglePlayPause?: () => void;
  stepPrev?: () => void;
  stepNext?: () => void;
}> = ({
  disabled = false,
  isPlaying = false,
  isFirstMove = false,
  isLastMove = false,
  togglePlayPause,
  stepPrev,
  stepNext,
}) => (
  // <span> wrappers needed so Tooltip can track cursor events while buttons
  // are disabled
  <>
    <Tooltip
      title={isFirstMove ? "Go to Last Move" : "Previous Move"}
      placement="right"
    >
      <span>
        <IconButton disabled={disabled} onClick={stepPrev}>
          {/* We can't go back from the first move, so offer to go to the end
              instead */}
          {isFirstMove ? (
            // Mirror the arrow so it's not the same as the "go to first" button
            <IconReplay transform="scale(-1,1)" />
          ) : (
            <IconKeyboardArrowLeft />
          )}
        </IconButton>
      </span>
    </Tooltip>

    <Tooltip
      title={isPlaying ? "Pause Sequence" : "Play Sequence"}
      placement="right"
    >
      <span>
        <IconButton disabled={disabled} onClick={togglePlayPause}>
          {isPlaying ? <IconPause /> : <IconPlayArrow />}
        </IconButton>
      </span>
    </Tooltip>

    <Tooltip
      title={isLastMove ? "Go to First Move" : "Next Move"}
      placement="right"
    >
      <span>
        {/* We can't go forward from the last move, so offer to go to back to
            the beginning instead */}
        <IconButton disabled={disabled} onClick={stepNext}>
          {isLastMove ? <IconReplay /> : <IconKeyboardArrowRight />}
        </IconButton>
      </span>
    </Tooltip>
  </>
);

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  // We want to show the buttons before the initial load, *and* while doing the
  // load. That way they're visible before creating/selecting a beta
  fallbackElement: <PlayPauseControlsContent />,
  preloadElement: <PlayPauseControlsContent />,
})(PlayPauseControls);
