import {
  PlayArrow as IconPlayArrow,
  Pause as IconPause,
  KeyboardArrowLeft as IconKeyboardArrowLeft,
  KeyboardArrowRight as IconKeyboardArrowRight,
  FirstPage as IconFirstPage,
  LastPage as IconLastPage,
} from "@mui/icons-material";
import { useContext, useEffect, useMemo, useState } from "react";
import { graphql, useFragment } from "react-relay";
import { withQuery } from "relay-query-wrapper";
import { betaQuery } from "../queries";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import { PlayPauseControls_betaNode$key } from "./__generated__/PlayPauseControls_betaNode.graphql";
import { EditorVisibilityContext } from "components/Editor/util/context";
import { useStanceControls } from "../util/stance";
import { alpha, Box, IconButton, Paper } from "@mui/material";

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
  const disabled = moveIds.length === 0;

  const {
    hasPrevious,
    hasNext,
    selectFirst,
    selectLast,
    selectPrevious,
    selectNext,
  } = useStanceControls(beta.moves);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const pause = (): void => setIsPlaying(false);

  // When playing is enabled, trigger an interval to step through the moves.
  // Interval will cancel itself when play state changes.
  useEffect(() => {
    if (isPlaying) {
      selectNext(); // Make first step immediately
      const intervalID = setInterval(selectNext, stepIntervalMs);
      return () => clearInterval(intervalID);
    }
  }, [isPlaying, selectNext]);

  // When we reach the last move, stop playing. Also, pause if the overlay is hidden
  useEffect(() => {
    if (!hasNext || !visibility) {
      pause();
    }
  }, [hasNext, visibility]);

  // This check has to go after all the hooks
  if (!visibility) {
    return null;
  }

  return (
    <Box
      position="absolute"
      bottom={({ spacing }) => spacing(1)}
      width="100%"
      display="flex"
      justifyContent="center"
      // Don't block pointer events for the SVG underneath
      sx={{ pointerEvents: "none" }}
    >
      <Paper
        sx={({ palette, shape, spacing }) => ({
          width: "100%",
          maxWidth: "sm",
          display: "flex",
          justifyContent: "space-between",
          margin: `0 ${spacing(1)}`,
          padding: 1,
          backgroundColor: alpha(
            palette.background.paper,
            palette.opacity.translucent
          ),
          borderRadius: shape.borderRadius,
          // Let all child buttons consume pointer events
          pointerEvents: "auto",
        })}
      >
        <IconButton
          aria-label="Go to First Move"
          disabled={disabled || !hasPrevious}
          onClick={() => {
            pause();
            selectFirst();
          }}
        >
          <IconFirstPage />
        </IconButton>

        <IconButton
          aria-label="Previous Move"
          disabled={disabled || !hasPrevious}
          onClick={() => {
            pause();
            selectPrevious();
          }}
        >
          <IconKeyboardArrowLeft />
        </IconButton>

        <IconButton
          aria-label={isPlaying ? "Pause Sequence" : "Play Sequence"}
          disabled={disabled || !hasNext}
          onClick={() => setIsPlaying((prev) => !prev)}
        >
          {isPlaying ? <IconPause /> : <IconPlayArrow />}
        </IconButton>

        <IconButton
          aria-label="Next Move"
          disabled={disabled || !hasNext}
          onClick={() => {
            pause();
            selectNext();
          }}
        >
          <IconKeyboardArrowRight />
        </IconButton>

        <IconButton
          aria-label="Go to Last Move"
          disabled={disabled || !hasNext}
          onClick={() => {
            pause();
            selectLast();
          }}
        >
          <IconLastPage />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default withQuery<queriesBetaQuery, Props>({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  // Don't show anything until the beta loads
  fallbackElement: null,
})(PlayPauseControls);
