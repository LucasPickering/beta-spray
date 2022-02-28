import React, { useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { Flex } from "rebass";
import { graphql } from "relay-runtime";
import NotFound from "../NotFound";
import BoulderImage from "./BoulderImage";
import HoldOverlay from "./HoldOverlay";
import ProblemList from "./ProblemList";
import { BetaEditorQuery } from "./__generated__/BetaEditorQuery.graphql";

interface Props {
  queryRef: PreloadedQuery<BetaEditorQuery>;
  selectedProblem: string | undefined;
  setSelectedProblem: (problemId: string) => void;
}

const BetaEditor: React.FC<Props> = ({
  queryRef,
  selectedProblem,
  setSelectedProblem,
}) => {
  const data = usePreloadedQuery<BetaEditorQuery>(
    graphql`
      query BetaEditorImageQuery(
        $imageId: ID!
        $problemId: ID!
        $includeProblem: Boolean!
      ) {
        image(id: $imageId) {
          ...BoulderImage_image
          ...ProblemList_image
          holds {
            ...HoldOverlay_holdConnection
          }
        }

        # Only fetch problem if one is selected
        # TODO split this into a separate query
        problem(id: $problemId) @include(if: $includeProblem) {
          holds {
            ...HoldOverlay_holdConnection
          }
        }
      }
    `,
    queryRef
  );

  // Aspect ratio is needed in order to scale the SVG to the raster image.
  // Populated when the boulder image loads.
  const [aspectRatio, setAspectRatio] = useState<number | undefined>();

  // uh oh, stinkyyyy
  if (!data.image) {
    return <NotFound />;
  }

  return (
    <Flex>
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
          <HoldOverlay
            // If a problem is selected+loaded, render its holds, otherwise
            // render all the holds for the image
            holdConnectionKey={
              data.problem ? data.problem.holds : data.image.holds
            }
            aspectRatio={aspectRatio}
          />
        )}
      </div>

      {/* Other stuff */}
      <ProblemList
        imageKey={data.image}
        selectedProblem={selectedProblem}
        setSelectedProblem={setSelectedProblem}
      />
    </Flex>
  );
};

export default BetaEditor;
