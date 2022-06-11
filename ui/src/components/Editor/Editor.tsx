import React, { useCallback, useEffect, useState } from "react";
import { useQueryLoader } from "react-relay";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assertIsDefined } from "util/func";
import type { queriesProblemQuery as queriesProblemQueryType } from "./__generated__/queriesProblemQuery.graphql";
import queriesProblemQuery from "./__generated__/queriesProblemQuery.graphql";
import type { queriesBetaQuery as queriesBetaQueryType } from "./__generated__/queriesBetaQuery.graphql";
import queriesBetaQuery from "./__generated__/queriesBetaQuery.graphql";
import { Box, IconButton, Paper } from "@mui/material";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { Home as IconHome } from "@mui/icons-material";
import {
  EditorSelectedMoveContext,
  EditorMode,
  EditorModeContext,
  EditorSelectedHoldContext,
  EditorHighlightedMoveContext,
} from "util/context";
import { ZoomPanProvider } from "util/zoom";
import BetaDetails from "./EditorControls/BetaDetails";
import BetaList from "./EditorControls/BetaList";
import EditorControls from "./EditorControls/EditorControls";
import EditorSvg from "./EditorSvg/EditorSvg";
import HelpText from "./EditorSvg/HelpText";
import EditorHelmet from "./EditorHelmet";
import ProblemName from "./EditorControls/ProblemName";
import ModeButton from "./EditorControls/ModeButton";

/**
 * Main app component, for viewing+editing boulders/problems/betas. This is
 * mainly just a shell for managing state that crosses between the editor
 * overlay (the controls that appear over the image, which is SVG) and the
 * sidebar (everything else, standard HTML).
 *
 * This root component initiates the GraphQL queries that populate the page, but
 * it doesn't *grab* that query data itself. Instead it just passes the query
 * refs down as needed. This allows us to render as much as possible immeidately,
 * and only block certain parts of the UI as needed. Much better than having
 * one fat loading icon.
 */
const Editor: React.FC = () => {
  const { problemId, betaId } = useParams();
  assertIsDefined(problemId); // Only undefined if routing isn't hooked up right

  const navigate = useNavigate();

  // Read initial state values from route
  const [selectedBeta, setSelectedBeta] = useState<string | undefined>(betaId);
  const [problemQueryRef, loadProblemQuery] =
    useQueryLoader<queriesProblemQueryType>(queriesProblemQuery);
  const [betaQueryRef, loadBetaQuery, disposeBetaQuery] =
    useQueryLoader<queriesBetaQueryType>(queriesBetaQuery);

  // ===
  // All 3 of these *don't* unpack the array, so they can be passed to context
  // without unnecessarily creating a new array object (and thus re-render)
  // ===
  // Toggle between editing holds and beta
  const editorModeState = useState<EditorMode>("beta");
  // Allows overlay to detect when a hold is clicked
  const selectedHoldState = useState<string>();
  // Which move is being emphasized
  const highlightedMoveState = useState<string>();
  // Which move is being edited
  const selectedMoveState = useState<string>();

  const refreshBetaQuery = useCallback(
    (betaId: string | undefined) => {
      if (betaId) {
        loadBetaQuery({ betaId });
      } else {
        // Beta is no longer selected, wipe out the query
        disposeBetaQuery();
      }
    },
    [loadBetaQuery, disposeBetaQuery]
  );

  // Load image data
  useEffect(() => {
    loadProblemQuery({ problemId });
  }, [loadProblemQuery, problemId]);
  useEffect(() => {
    refreshBetaQuery(selectedBeta);
  }, [refreshBetaQuery, selectedBeta]);

  // Make sure state stays in sync with the URL
  // In most cases we should update both of these simultaneously so this hook
  // generally doesn't do anything, but it's a backup (e.g. if user externally
  // navigates to a different beta via bookmark, back button, etc.)
  useEffect(() => {
    setSelectedBeta(betaId);
  }, [betaId]);

  const onSelectBeta = useCallback(
    (betaId: string | undefined) => {
      setSelectedBeta(betaId);
      // Start beta query ASAP (gotta go fast)
      refreshBetaQuery(betaId);
      navigate(
        betaId
          ? `/problems/${problemId}/beta/${betaId}`
          : `/problems/${problemId}`,
        // Navigation doesn't really change the page
        { replace: true }
      );
    },
    [refreshBetaQuery, navigate, problemId]
  );

  // Figure out which help text to show based on editor state
  const helpMode = (() => {
    switch (editorModeState[0]) {
      case "holds":
        return "editHolds";
      case "beta":
        return selectedBeta ? "editBeta" : "noBeta";
    }
  })();

  return (
    <DndProvider
      backend={TouchBackend}
      options={{ enableTouchEvents: true, enableMouseEvents: true }}
    >
      <EditorHelmet queryRef={problemQueryRef} />

      <EditorModeContext.Provider value={editorModeState}>
        <EditorSelectedHoldContext.Provider value={selectedHoldState}>
          <EditorHighlightedMoveContext.Provider value={highlightedMoveState}>
            <EditorSelectedMoveContext.Provider value={selectedMoveState}>
              <ZoomPanProvider>
                {/* The maximum possible display area (the full screen) */}
                <Box
                  display="flex"
                  justifyContent="center"
                  // Anchor for overlay button positioning
                  position="relative"
                  width="100vw"
                  height="100vh"
                  // Hide the image when it grows bigger than the viewport
                  sx={{ overflow: "hidden" }}
                >
                  {/* Wrapper for the SVG, to provide background color and spacing
                    during loading */}
                  <Box
                    width="100%"
                    height="100%"
                    sx={({ palette }) => ({
                      backgroundColor: palette.background.paper,
                    })}
                  >
                    <EditorSvg
                      queryRef={problemQueryRef}
                      betaQueryRef={betaQueryRef}
                      selectedBeta={selectedBeta}
                    />
                  </Box>

                  {/* Top-left overlay buttons */}
                  <Paper
                    sx={{ position: "absolute", top: 0, left: 0, margin: 1 }}
                  >
                    <IconButton component={Link} to="/">
                      <IconHome />
                    </IconButton>

                    <HelpText helpMode={helpMode} />
                  </Paper>

                  {/* Top-right overlay buttons are mobile-only, so they live in
                    EditorDrawer */}

                  {/* Controls sidebar/drawer */}
                  <EditorControls>
                    <ProblemName queryRef={problemQueryRef} />
                    <ModeButton />
                    <BetaList
                      queryRef={problemQueryRef}
                      selectedBeta={selectedBeta}
                      onSelectBeta={onSelectBeta}
                    />
                    <BetaDetails queryRef={betaQueryRef} />
                  </EditorControls>
                </Box>
              </ZoomPanProvider>
            </EditorSelectedMoveContext.Provider>
          </EditorHighlightedMoveContext.Provider>
        </EditorSelectedHoldContext.Provider>
      </EditorModeContext.Provider>
    </DndProvider>
  );
};

export default Editor;
