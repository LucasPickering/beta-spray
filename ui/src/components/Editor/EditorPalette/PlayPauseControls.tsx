import {
  PlayArrow as IconPlayArrow,
  Pause as IconPause,
  KeyboardArrowLeft as IconKeyboardArrowLeft,
  KeyboardArrowRight as IconKeyboardArrowRight,
  FirstPage as IconFirstPage,
  LastPage as IconLastPage,
} from "@mui/icons-material";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { withQuery } from "relay-query-wrapper";
import { betaQuery } from "../queries";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import { PlayPauseControls_betaNode$key } from "./__generated__/PlayPauseControls_betaNode.graphql";
import { EditorVisibilityContext } from "components/Editor/util/context";
import { StanceControls, useStanceControls } from "../util/stance";
import TooltipIconButton from "components/common/TooltipIconButton";

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
    <TooltipIconButton
      title="Go to First Move"
      placement="bottom"
      disabled={disabled || !hasPrevious}
      onClick={selectFirst}
    >
      <IconFirstPage />
    </TooltipIconButton>

    <TooltipIconButton
      title="Previous Move"
      placement="bottom"
      disabled={disabled || !hasPrevious}
      onClick={selectPrevious}
    >
      <IconKeyboardArrowLeft />
    </TooltipIconButton>

    <TooltipIconButton
      title={isPlaying ? "Pause Sequence" : "Play Sequence"}
      placement="bottom"
      disabled={disabled}
      onClick={togglePlayPause}
    >
      {isPlaying ? <IconPause /> : <IconPlayArrow />}
    </TooltipIconButton>

    <TooltipIconButton
      title="Next Move"
      placement="bottom"
      disabled={disabled || !hasNext}
      onClick={selectNext}
    >
      <IconKeyboardArrowRight />
    </TooltipIconButton>

    <TooltipIconButton
      title="Go to Last Move"
      placement="bottom"
      disabled={disabled || !hasNext}
      onClick={selectLast}
    >
      <IconLastPage />
    </TooltipIconButton>
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
