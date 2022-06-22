import React, { useCallback, useState } from "react";
import type { queriesProblemQuery as queriesProblemQueryType } from "__generated__/queriesProblemQuery.graphql";
import type { queriesBetaQuery as queriesBetaQueryType } from "__generated__/queriesBetaQuery.graphql";
import { Box, IconButton, Paper } from "@mui/material";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { Home as IconHome } from "@mui/icons-material";
import {
  EditorHighlightedMoveContext,
  EditorMode,
  EditorModeContext,
  EditorSelectedHoldContext,
} from "util/context";
import { ZoomPanProvider } from "util/zoom";
import BetaDetails from "./EditorControls/BetaDetails";
import BetaList from "./EditorControls/BetaList";
import EditorControls from "./EditorControls/EditorControls";
import EditorSvg from "./EditorSvg/EditorSvg";
import HelpText from "./EditorSvg/HelpText";
import EditorHead from "./EditorHelmet";
import ProblemName from "./EditorControls/ProblemName";
import ModeButton from "./EditorControls/ModeButton";
import { PreloadedQuery } from "react-relay";
import { useRouter } from "next/router";
import RouterLink from "next/link";

interface Props {
  problemId: string;
  betaId?: string;
  queryRefs: {
    problem: PreloadedQuery<queriesProblemQueryType>;
    beta?: PreloadedQuery<queriesBetaQueryType>;
  };
}

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
const Editor: React.FC<Props> = ({ problemId, betaId, queryRefs }) => {
  const router = useRouter();

  // ===
  // All 3 of these *don't* unpack the array, so they can be passed to context
  // without unnecessarily creating a new array object (and thus re-render)
  // ===
  // Toggle between editing holds and beta
  const editorModeState = useState<EditorMode>("beta");
  // Allows overlay to detect when a hold is clicked
  const selectedHoldState = useState<string>();
  // Link hovering between move list and overlay
  const highlightedMoveState = useState<string | undefined>();

  const onSelectBeta = useCallback(
    (betaId: string | undefined) => {
      // Navigation doesn't really change the page, so overwrite in history
      router.replace(
        betaId
          ? `/problems/${problemId}/beta/${betaId}`
          : `/problems/${problemId}`
      );
    },
    [router, problemId]
  );

  // Figure out which help text to show based on editor state
  const helpMode = (() => {
    switch (editorModeState[0]) {
      case "holds":
        return "editHolds";
      case "beta":
        return betaId ? "editBeta" : "noBeta";
    }
  })();

  return (
    <DndProvider
      backend={TouchBackend}
      options={{ enableTouchEvents: true, enableMouseEvents: true }}
    >
      <EditorHead queryRef={queryRefs.problem} />

      <EditorModeContext.Provider value={editorModeState}>
        <EditorSelectedHoldContext.Provider value={selectedHoldState}>
          <EditorHighlightedMoveContext.Provider value={highlightedMoveState}>
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
                    queryRef={queryRefs.problem}
                    betaQueryRef={queryRefs.beta}
                    selectedBeta={betaId}
                  />
                </Box>

                {/* Top-left overlay buttons */}
                <Paper
                  sx={{ position: "absolute", top: 0, left: 0, margin: 1 }}
                >
                  <RouterLink href="/" passHref>
                    <IconButton>
                      <IconHome />
                    </IconButton>
                  </RouterLink>

                  <HelpText helpMode={helpMode} />
                </Paper>

                {/* Top-right overlay buttons are mobile-only, so they live in
                    EditorDrawer */}

                {/* Controls sidebar/drawer */}
                <EditorControls>
                  <ProblemName queryRef={queryRefs.problem} />
                  <ModeButton />
                  <BetaList
                    queryRef={queryRefs.problem}
                    selectedBeta={betaId}
                    onSelectBeta={onSelectBeta}
                  />
                  <BetaDetails queryRef={queryRefs.beta} />
                </EditorControls>
              </Box>
            </ZoomPanProvider>
          </EditorHighlightedMoveContext.Provider>
        </EditorSelectedHoldContext.Provider>
      </EditorModeContext.Provider>
    </DndProvider>
  );
};

export default Editor;
