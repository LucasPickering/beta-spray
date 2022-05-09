import React, { useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";
import NotFound from "../NotFound";
import BetaDetails from "./EditorControls/BetaDetails";
import BetaList from "./EditorControls/BetaList";
import BetaEditor from "./EditorSvg/BetaEditor/BetaEditor";
import BoulderImage from "./EditorSvg/BoulderImage";
import EditorSvg from "./EditorSvg/EditorSvg";
import EditorControls from "./EditorControls/EditorControls";
import { EditorQuery } from "./__generated__/EditorQuery.graphql";
import HoldEditor from "./EditorSvg/HoldEditor/HoldEditor";
import { Box, IconButton, Stack } from "@mui/material";
import HoldMarks from "./EditorSvg/HoldEditor/HoldMarks";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import HelpText from "./EditorSvg/HelpText";
import DragLayer from "./EditorSvg/DragLayer";
import { Helmet } from "react-helmet-async";
import { ZoomOffset } from "./EditorSvg/types";
import { Link } from "react-router-dom";
import { Home as IconHome } from "@mui/icons-material";
import { EditorContext } from "util/context";

interface Props {
  queryRef: PreloadedQuery<EditorQuery>;
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string | undefined) => void;
}

/**
 * Main app component, for viewing+editing boulders/problems/betas. This is
 * mainly just a shell for managing state that crosses between the editor
 * overlay (the controls that appear over the image, which is SVG) and the
 * sidebar (everything else, standard HTML).
 */
const Editor: React.FC<Props> = ({
  queryRef,
  selectedBeta,
  setSelectedBeta,
}) => {
  const data = usePreloadedQuery<EditorQuery>(
    graphql`
      query EditorQuery($problemId: ID!, $betaId: ID!) {
        problem(id: $problemId) {
          name
          boulder {
            image {
              url
            }
            ...EditorSvg_boulderNode
            ...BoulderImage_boulderNode
          }
          ...BetaList_problemNode
          ...HoldEditor_problemNode
          holds {
            ...HoldMarks_holdConnection
          }
        }

        # TODO split this into a separate query
        beta(id: $betaId) {
          ...BetaDetails_betaNode
          ...BetaEditor_betaNode
        }
      }
    `,
    queryRef
  );

  // Zoom and offset are controlled by scrolling on the SVG
  const [zoomOffset, setZoomOffset] = useState<ZoomOffset>({
    zoom: 1,
    offset: { x: 0, y: 0 },
  });
  // Toggle hold editor overlay
  const [editingHolds, setEditingHolds] = useState<boolean>(false);
  // Allows overlay to detect when a hold is clicked
  const [selectedHold, setSelectedHold] = useState<string>();
  // Link hovering between move list and overlay
  const [highlightedMove, setHighlightedMove] = useState<string | undefined>();

  // uh oh, stinkyyyy
  if (!data.problem) {
    return <NotFound />;
  }

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
      <Helmet>
        <title>{data.problem.name} - Beta Spray</title>
        <meta property="og:image" content={data.problem.boulder.image.url} />
      </Helmet>

      <EditorContext.Provider
        value={{
          editingHolds,
          setEditingHolds,
          selectedHold,
          setSelectedHold,
          highlightedMove,
          setHighlightedMove,
          zoomOffset,
          setZoomOffset,
        }}
      >
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
          <EditorSvg boulderKey={data.problem.boulder}>
            <BoulderImage boulderKey={data.problem.boulder} />

            {/* This has to go before other interactive stuff so it doesn't eat
                events from other components */}
            <DragLayer mode="svg" />

            {editingHolds ? (
              <HoldEditor problemKey={data.problem} />
            ) : (
              <HoldMarks
                holdConnectionKey={data.problem.holds}
                // Selecting a hold opens the move modal, which shouldn't be
                // possible if no beta is selected
                onClick={selectedBeta ? setSelectedHold : undefined}
              />
            )}

            {data.beta && !editingHolds && <BetaEditor betaKey={data.beta} />}
          </EditorSvg>

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
            <BetaList
              problemKey={data.problem}
              selectedBeta={selectedBeta}
              setSelectedBeta={setSelectedBeta}
            />

            {data.beta && <BetaDetails dataKey={data.beta} />}

            <DragLayer mode="html" />
          </EditorControls>
        </Box>
      </EditorContext.Provider>
    </DndProvider>
  );
};

export default Editor;
