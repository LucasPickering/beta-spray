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
import { StanceControls, useStanceControls } from "../util/stance";

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
          ...stance_betaMoveNodeConnection
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

  const stanceControls = useStanceControls(beta.moves);
  const { hasNext, selectNext } = stanceControls;
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const togglePlayPause = useCallback(() => setIsPlaying((prev) => !prev), []);

  // When playing is enabled, trigger an interval to step through the moves.
  // Interval will cancel itself when play state changes.
  useEffect(() => {
    if (isPlaying) {
      selectNext(); // Make first step immediately
      const intervalID = setInterval(selectNext, stepIntervalMs);
      return () => clearInterval(intervalID);
    }
  }, [isPlaying, selectNext]);

  // When we reach the last move, stop playing
  useEffect(() => {
    if (!hasNext) {
      setIsPlaying(false);
    }
  }, [hasNext]);

  return (
    <PlayPauseControlsContent
      // Disable buttons while the overlay is disabled
      disabled={!visibility || moveIds.length === 0}
      isPlaying={isPlaying}
      togglePlayPause={togglePlayPause}
      {...stanceControls}
    />
  );
};

/**
 * A dumb helper component to render the buttons. This makes it easy to render
 * placeholder buttons when no beta is available.
 */
const PlayPauseControlsContent: React.FC<
  // All fields must be optional to support the visual-only preview element
  {
    disabled?: boolean;
    isPlaying?: boolean;
    togglePlayPause?: () => void;
  } & Partial<StanceControls>
> = ({
  disabled = false,
  isPlaying = false,
  togglePlayPause,
  hasPrevious = false,
  hasNext = false,
  selectPrevious,
  selectNext,
  selectFirst,
  selectLast,
}) => (
  // <span> wrappers needed so Tooltip can track cursor events while buttons
  // are disabled
  <>
    <Tooltip
      title={hasPrevious ? "Go to Last Move" : "Previous Move"}
      placement="right"
    >
      <span>
        <IconButton
          disabled={disabled}
          onClick={hasPrevious ? selectPrevious : selectLast}
        >
          {/* We can't go back from the first move, so offer to go to the end
              instead */}
          {hasPrevious ? (
            <IconKeyboardArrowLeft />
          ) : (
            // Mirror the arrow so it's not the same as the "go to first" button
            <IconReplay transform="scale(-1,1)" />
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
      title={hasNext ? "Go to First Move" : "Next Move"}
      placement="right"
    >
      <span>
        {/* We can't go forward from the last move, so offer to go to back to
            the beginning instead */}
        <IconButton
          disabled={disabled}
          onClick={hasNext ? selectNext : selectFirst}
        >
          {hasNext ? <IconKeyboardArrowRight /> : <IconReplay />}
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
