import React, { useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";
import NotFound from "../NotFound";
import BetaDetails from "./EditorControls/BetaDetails";
import BetaList from "./EditorControls/BetaList";
import BetaEditor from "./EditorOverlay/BetaEditor/BetaEditor";
import BoulderImage from "./BoulderImage";
import EditorOverlay from "./EditorOverlay/EditorOverlay";
import EditorControls from "./EditorControls/EditorControls";
import { EditorQuery } from "./__generated__/EditorQuery.graphql";
import HoldEditor from "./EditorOverlay/HoldEditor/HoldEditor";
import { Box } from "@mui/material";
import HoldMarks from "./EditorOverlay/HoldEditor/HoldMarks";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import EditorContext from "context/EditorContext";
import HelpText from "./EditorOverlay/HelpText";
import { DragLayer } from "./EditorOverlay/DragLayer";

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
          image {
            ...BoulderImage_imageNode
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

  // Aspect ratio is needed in order to scale the SVG to the raster image.
  // Populated when the boulder image loads.
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();
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
      <EditorContext.Provider
        value={{
          editingHolds,
          setEditingHolds,
          selectedHold,
          setSelectedHold,
          highlightedMove,
          setHighlightedMove,
        }}
      >
        <Box
          display="flex"
          justifyContent="center"
          // For sidebar overlay positioning
          position="relative"
          maxHeight="calc(100vh - 48px)"
          // Prevent mystical scroll bar
          sx={{ overflowY: "hidden" }}
        >
          {/* The boulder image and decorations */}
          <Box position="relative" height="fit-content">
            <BoulderImage
              imageKey={data.problem.image}
              onLoad={(e) => {
                const el = e.currentTarget;
                setAspectRatio(el.width / el.height);
              }}
            />

            {/* Don't render overlay until image loads */}
            {aspectRatio !== undefined && (
              <EditorOverlay aspectRatio={aspectRatio}>
                {/* This has to go before everything else so it doesn't eat
                    drop events */}
                <DragLayer mode="svg" />

                {editingHolds ? (
                  <HoldEditor problemKey={data.problem} />
                ) : (
                  <HoldMarks
                    holdConnectionKey={data.problem.holds}
                    onClick={setSelectedHold}
                  />
                )}

                {data.beta && !editingHolds && (
                  <BetaEditor betaKey={data.beta} />
                )}
              </EditorOverlay>
            )}

            {/* Help text goes below overlay so it doesn't block anything */}
            {helpMode && <HelpText helpMode={helpMode} />}
          </Box>

          {/* Other stuff */}
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
