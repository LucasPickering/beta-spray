import React, { useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { graphql } from "relay-runtime";
import NotFound from "../NotFound";
import BetaDetails from "./EditorSidebar/BetaDetails";
import BetaList from "./EditorSidebar/BetaList";
import ProblemList from "./EditorSidebar/ProblemList";
import BetaEditor from "./EditorOverlay/BetaEditor/BetaEditor";
import BoulderImage from "./BoulderImage";
import EditorOverlay from "./EditorOverlay/EditorOverlay";
import classes from "./Editor.scss";
import EditorSidebar from "./EditorSidebar/EditorSidebar";
import { EditorQuery } from "./__generated__/EditorQuery.graphql";
import HoldEditor from "./EditorOverlay/HoldEditor/HoldEditor";
import { Button, useBoolean } from "@chakra-ui/react";
import HoldMarkers from "./EditorOverlay/HoldEditor/HoldMarkers";

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

  // uh oh, stinkyyyy
  if (!data.image) {
    return <NotFound />;
  }

  return (
    <div className={classes.editor}>
      {/* The boulder image and decorations */}
      <div
        style={{
          position: "relative",
          display: "inline-block",
          height: "100vh",
        }}
      >
        <BoulderImage
          imageKey={data.image}
          onLoad={(e) => {
            const el = e.currentTarget;
            setAspectRatio(el.width / el.height);
          }}
        />

        {/* Don't render overlay until image loads */}
        {aspectRatio && (
          <EditorOverlay aspectRatio={aspectRatio}>
            {editingHolds ? (
              <HoldEditor imageKey={data.image} problemKey={data.problem} />
            ) : (
              <HoldMarkers
                holdConnectionKey={data.image.holds}
                onClick={setSelectedHold}
              />
            )}

            {data.beta && (
              <BetaEditor
                dataKey={data.beta}
                selectedHold={selectedHold}
                setSelectedHold={setSelectedHold}
              />
            )}
          </EditorOverlay>
        )}
      </div>

      {/* Other stuff */}
      <EditorSidebar>
        <Button onClick={() => setEditingHolds.toggle()}>
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
    </div>
  );
};

export default Editor;
