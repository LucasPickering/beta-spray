import React, { Suspense, useEffect, useState } from "react";
import { useQueryLoader } from "react-relay";
import { useNavigate, useParams } from "react-router-dom";
import { assertIsDefined } from "util/func";
import Loading from "../Loading";
import type { BetaEditorQuery as BetaEditorQueryType } from "./__generated__/BetaEditorQuery.graphql";
import BetaEditorQuery from "./__generated__/BetaEditorQuery.graphql";
import BetaEditor from "./BetaEditor";

const BetaEditorLoader: React.FC = () => {
  const { imageId, problemId, betaId } = useParams();
  assertIsDefined(imageId); // Only undefined if routing isn't hooked up right

  const navigate = useNavigate();

  // Read initial state values from route
  const [selectedProblem, setSelectedProblem] = useState<string | undefined>(
    problemId
  );
  const [selectedBeta, setSelectedBeta] = useState<string | undefined>(betaId);
  const [imageQueryRef, loadImageQuery] =
    useQueryLoader<BetaEditorQueryType>(BetaEditorQuery);

  // Load image data
  useEffect(() => {
    loadImageQuery({
      imageId,
      problemId: selectedProblem ?? "",
      betaId: selectedBeta ?? "",
    });
  }, [loadImageQuery, imageId, selectedProblem, selectedBeta]);

  return (
    <Suspense fallback={<Loading />}>
      {imageQueryRef && (
        <BetaEditor
          queryRef={imageQueryRef}
          selectedProblem={selectedProblem}
          selectedBeta={selectedBeta}
          // Update route when changing selection
          setSelectedProblem={(problemId) => {
            setSelectedProblem(problemId);
            navigate(`/images/${imageId}/problems/${problemId}`);
          }}
          setSelectedBeta={(betaId) => {
            setSelectedBeta(betaId);
            navigate(
              `/images/${imageId}/problems/${selectedProblem}/beta/${betaId}`
            );
          }}
        />
      )}
    </Suspense>
  );
};

export default BetaEditorLoader;
