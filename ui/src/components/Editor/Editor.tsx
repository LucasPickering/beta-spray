import React, { useEffect, useState } from "react";
import { useQueryLoader } from "react-relay";
import { Link, useNavigate, useParams } from "react-router-dom";
import { assertIsDefined } from "util/func";
import type { queriesEditorQuery as queriesEditorQueryType } from "./__generated__/queriesEditorQuery.graphql";
import queriesEditorQuery from "./__generated__/queriesEditorQuery.graphql";
import { Box, Stack, IconButton } from "@mui/material";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import { Home as IconHome } from "@mui/icons-material";
import { EditorContext } from "util/context";
import { ZoomPanProvider } from "util/zoom";
import BetaDetails from "./EditorControls/BetaDetails";
import BetaList from "./EditorControls/BetaList";
import EditorControls from "./EditorControls/EditorControls";
import DragLayer from "./EditorSvg/DragLayer";
import EditorSvg from "./EditorSvg/EditorSvg";
import HelpText from "./EditorSvg/HelpText";
import EditorHelmet from "./EditorHelmet";

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
  const [queryRef, loadQuery] =
    useQueryLoader<queriesEditorQueryType>(queriesEditorQuery);

  // Toggle hold editor overlay
  const [editingHolds, setEditingHolds] = useState<boolean>(false);
  // Allows overlay to detect when a hold is clicked
  const [selectedHold, setSelectedHold] = useState<string>();
  // Link hovering between move list and overlay
  const [highlightedMove, setHighlightedMove] = useState<string | undefined>();

  // Load image data
  useEffect(() => {
    loadQuery({
      problemId,
      betaId: selectedBeta ?? "",
    });
  }, [loadQuery, problemId, selectedBeta]);

  // Make sure state stays in sync with the URL
  // In most cases we should update both of these simultaneously so this hook
  // generally doesn't do anything, but it's a backup (e.g. if user externally
  // navigates to a different beta via bookmark, back button, etc.)
  useEffect(() => {
    setSelectedBeta(betaId);
  }, [betaId]);

  const helpMode = (() => {
    if (editingHolds) {
      return "editHolds";
    }
    if (!selectedBeta) {
      return "noBeta";
    }
    return "editBeta";
  })();

  return (
    <DndProvider
      backend={TouchBackend}
      options={{
        enableTouchEvents: true,
        enableMouseEvents: true,
      }}
    >
      <EditorHelmet queryRef={queryRef} />

      <EditorContext.Provider
        value={{
          selectedBeta,
          setSelectedBeta: (betaId) => {
            setSelectedBeta(betaId);
            navigate(
              betaId
                ? `/problems/${problemId}/beta/${betaId}`
                : `/problems/${problemId}`,
              // Navigation doesn't really change the page
              { replace: true }
            );
          },
          editingHolds,
          setEditingHolds,
          selectedHold,
          setSelectedHold,
          highlightedMove,
          setHighlightedMove,
        }}
      >
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
              <EditorSvg queryRef={queryRef} />
            </Box>

            {/* Top-left overlay buttons */}
            <Stack
              position="absolute"
              top={0}
              left={0}
              padding={1}
              direction="row"
              spacing={1}
            >
              <IconButton component={Link} to="/" size="small">
                <IconHome />
              </IconButton>

              <HelpText helpMode={helpMode} />
            </Stack>

            {/* Controls sidebar/drawer */}
            <EditorControls>
              <BetaList queryRef={queryRef} />

              <BetaDetails queryRef={queryRef} />

              <DragLayer mode="html" />
            </EditorControls>
          </Box>
        </ZoomPanProvider>
      </EditorContext.Provider>
    </DndProvider>
  );
};

export default Editor;
