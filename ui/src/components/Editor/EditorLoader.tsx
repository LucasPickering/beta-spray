import React, { Suspense, useEffect, useState } from "react";
import { useQueryLoader } from "react-relay";
import { useNavigate, useParams } from "react-router-dom";
import { assertIsDefined } from "util/func";
import Loading from "../Loading";
import type { EditorQuery as EditorQueryType } from "./__generated__/EditorQuery.graphql";
import EditorQuery from "./__generated__/EditorQuery.graphql";
import Editor from "./Editor";

const EditorLoader: React.FC = () => {
  const { imageId, problemId, betaId } = useParams();
  assertIsDefined(imageId); // Only undefined if routing isn't hooked up right

  const navigate = useNavigate();

  // Read initial state values from route
  const [selectedProblem, setSelectedProblem] = useState<string | undefined>(
    problemId
  );
  const [selectedBeta, setSelectedBeta] = useState<string | undefined>(betaId);
  const [imageQueryRef, loadImageQuery] =
    useQueryLoader<EditorQueryType>(EditorQuery);

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
        <Editor
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

export default EditorLoader;
