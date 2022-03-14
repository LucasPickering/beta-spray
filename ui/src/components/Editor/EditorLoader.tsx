import React, { Suspense, useEffect, useState } from "react";
import { useQueryLoader } from "react-relay";
import { useNavigate, useParams } from "react-router-dom";
import { assertIsDefined } from "util/func";
import Loading from "../Loading";
import type { EditorQuery as EditorQueryType } from "./__generated__/EditorQuery.graphql";
import EditorQuery from "./__generated__/EditorQuery.graphql";
import Editor from "./Editor";

const EditorLoader: React.FC = () => {
  const { problemId, betaId } = useParams();
  assertIsDefined(problemId); // Only undefined if routing isn't hooked up right

  const navigate = useNavigate();

  // Read initial state values from route
  const [selectedBeta, setSelectedBeta] = useState<string | undefined>(betaId);
  const [queryRef, loadQuery] = useQueryLoader<EditorQueryType>(EditorQuery);

  // Load image data
  useEffect(() => {
    loadQuery({
      problemId,
      betaId: selectedBeta ?? "",
    });
  }, [loadQuery, problemId, selectedBeta]);

  return (
    <Suspense fallback={<Loading />}>
      {queryRef && (
        <Editor
          queryRef={queryRef}
          selectedBeta={selectedBeta}
          // Update route when changing selection
          setSelectedBeta={(betaId) => {
            setSelectedBeta(betaId);
            navigate(
              betaId
                ? `/problems/${problemId}/beta/${betaId}`
                : `/problems/${problemId}`,
              // Navigation doesn't really change the page
              { replace: true }
            );
          }}
        />
      )}
    </Suspense>
  );
};

export default EditorLoader;
