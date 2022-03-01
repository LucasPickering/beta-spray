import React, { useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { Flex } from "rebass";
import { graphql } from "relay-runtime";
import NotFound from "../NotFound";
import BetaDetails from "./BetaDetails";
import BetaList from "./BetaList";
import BetaOverlay from "./BetaOverlay";
import BoulderImage from "./BoulderImage";
import HoldOverlay from "./HoldOverlay";
import Overlay from "./Overlay";
import ProblemList from "./ProblemList";
import { BetaEditorQuery } from "./__generated__/BetaEditorQuery.graphql";

interface Props {
  queryRef: PreloadedQuery<BetaEditorQuery>;
  selectedProblem: string | undefined;
  selectedBeta: string | undefined;
  setSelectedProblem: (problemId: string) => void;
  setSelectedBeta: (betaId: string) => void;
}

/**
 * Main app component, for viewing+editing boulders/problems/betas
 */
const BetaEditor: React.FC<Props> = ({
  queryRef,
  selectedProblem,
  selectedBeta,
  setSelectedProblem,
  setSelectedBeta,
}) => {
  const data = usePreloadedQuery<BetaEditorQuery>(
    graphql`
      query BetaEditorQuery($imageId: ID!, $problemId: ID!, $betaId: ID!) {
        image(id: $imageId) {
          ...BoulderImage_image
          problems {
            ...ProblemList_problemConnection
          }
          holds {
            ...HoldOverlay_holdConnection
          }
        }

        # TODO split this into a separate query
        problem(id: $problemId) {
          holds {
            ...HoldOverlay_holdConnection
          }
          betas {
            ...BetaList_betaConnection
          }
        }

        # TODO split this into a separate query
        beta(id: $betaId) {
          ...BetaDetails_betaNode
          ...BetaOverlay_betaNode
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
          dataKey={data.image}
          onLoad={(e) => {
            const el = e.currentTarget;
            setAspectRatio(el.width / el.height);
          }}
        />
        {/* Don't render overlay until image loads */}
        {aspectRatio && (
          <Overlay aspectRatio={aspectRatio}>
            <HoldOverlay
              // If a problem is selected+loaded, render its holds, otherwise
              // render all the holds for the image
              dataKey={data.problem ? data.problem.holds : data.image.holds}
            />
            {data.beta && <BetaOverlay dataKey={data.beta} />}
          </Overlay>
        )}
      </div>

      {/* Other stuff */}
      <Flex flexDirection="column">
        <ProblemList
          dataKey={data.image.problems}
          selectedProblem={selectedProblem}
          setSelectedProblem={setSelectedProblem}
        />
        {data.problem && (
          <BetaList
            dataKey={data.problem.betas}
            selectedBeta={selectedBeta}
            setSelectedBeta={setSelectedBeta}
          />
        )}
        {data.beta && <BetaDetails dataKey={data.beta} />}
      </Flex>
    </Flex>
  );
};

export default BetaEditor;
