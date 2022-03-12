import React, { useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";
import { Link as RouterLink } from "react-router-dom";
import NotFound from "../NotFound";
import BetaDetails from "./EditorSidebar/BetaDetails";
import BetaList from "./EditorSidebar/BetaList";
import ProblemList from "./EditorSidebar/ProblemList";
import BetaEditor from "./EditorOverlay/BetaEditor/BetaEditor";
import BoulderImage from "./BoulderImage";
import EditorOverlay from "./EditorOverlay/EditorOverlay";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import { EditorQuery } from "./__generated__/EditorQuery.graphql";
import HoldEditor from "./EditorOverlay/HoldEditor/HoldEditor";
import { Box, Button, Flex, useBoolean } from "@chakra-ui/react";
import HoldMarkers from "./EditorOverlay/HoldEditor/HoldMarkers";
import { DndProvider } from "react-dnd";
import MouseBackEnd from "react-dnd-mouse-backend";
import EditorContext from "context/EditorContext";

interface Props {
  queryRef: PreloadedQuery<EditorQuery>;
  selectedProblem: string | undefined;
  selectedBeta: string | undefined;
  setSelectedProblem: (problemId: string) => void;
  setSelectedBeta: (betaId: string) => void;
}

/**
 * Main app component, for viewing+editing boulders/problems/betas. This is
 * mainly just a shell for managing state that crosses between the editor
 * overlay (the controls that appear over the image, which is SVG) and the
 * sidebar (everything else, standard HTML).
 */
const Editor: React.FC<Props> = ({
  queryRef,
  selectedProblem,
  selectedBeta,
  setSelectedProblem,
  setSelectedBeta,
}) => {
  const data = usePreloadedQuery<EditorQuery>(
    graphql`
      query EditorQuery($imageId: ID!, $problemId: ID!, $betaId: ID!) {
        image(id: $imageId) {
          ...BoulderImage_imageNode
          ...ProblemList_imageNode
          ...HoldEditor_imageNode
          holds {
            ...HoldMarkers_holdConnection
          }
        }

        # TODO split this into a separate query
        problem(id: $problemId) {
          ...BetaList_problemNode
          ...HoldEditor_problemNode
          holds {
            ...HoldMarkers_holdConnection
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
  const [editingHolds, setEditingHolds] = useBoolean(false);
  // Allows overlay to detect when a hold is clicked
  const [selectedHold, setSelectedHold] = useState<string>();
  // Link hovering between move list and overlay
  const [highlightedMove, setHighlightedMove] = useState<string | undefined>();

  // uh oh, stinkyyyy
  if (!data.image) {
    return <NotFound />;
  }

  return (
    <DndProvider backend={MouseBackEnd}>
      <EditorContext.Provider
        value={{
          selectedHold,
          setSelectedHold,
          highlightedMove,
          setHighlightedMove,
        }}
      >
        <Flex justifyContent="center">
          {/* The boulder image and decorations */}
          <Box position="relative" maxWidth="100vw" maxHeight="100vh">
            <BoulderImage
              imageKey={data.image}
              onLoad={(e) => {
                const el = e.currentTarget;
                setAspectRatio(el.width / el.height);
              }}
            />

            {/* Don't render overlay until image loads */}
            {aspectRatio !== undefined && (
              <EditorOverlay aspectRatio={aspectRatio}>
                {editingHolds ? (
                  <HoldEditor imageKey={data.image} problemKey={data.problem} />
                ) : (
                  <HoldMarkers
                    // If filtered to a problem, show those holds, otherwise show
                    //  all holds for the image
                    holdConnectionKey={
                      data.problem ? data.problem.holds : data.image.holds
                    }
                    onClick={setSelectedHold}
                  />
                )}

                {data.beta && !editingHolds && (
                  <BetaEditor betaKey={data.beta} />
                )}
              </EditorOverlay>
            )}
          </Box>

          {/* Other stuff */}
          <EditorSidebar>
            <Button width="100%" as={RouterLink} to="/">
              Home
            </Button>
            <Button width="100%" onClick={() => setEditingHolds.toggle()}>
              {editingHolds ? "Done" : "Edit Holds"}
            </Button>
            <ProblemList
              imageKey={data.image}
              selectedProblem={selectedProblem}
              setSelectedProblem={setSelectedProblem}
            />
            {data.problem && (
              <BetaList
                problemKey={data.problem}
                selectedBeta={selectedBeta}
                setSelectedBeta={setSelectedBeta}
              />
            )}
            {data.beta && <BetaDetails dataKey={data.beta} />}
          </EditorSidebar>
        </Flex>
      </EditorContext.Provider>
    </DndProvider>
  );
};

export default Editor;
