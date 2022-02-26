import React, { Suspense, useEffect } from "react";
import { useQueryLoader } from "react-relay";
import { useParams } from "react-router-dom";
import { assertIsDefined } from "util/func";
import Loading from "../Loading";
import type { BetaEditorQuery as BetaEditorQueryType } from "./__generated__/BetaEditorQuery.graphql";
import BetaEditorQuery from "./__generated__/BetaEditorQuery.graphql";
import BetaEditor from "./BetaEditor";

const BetaEditorLoader: React.FC = () => {
  const { imageId } = useParams();
  assertIsDefined(imageId); // Only undefined if routing isn't hooked up right

  const [imageQueryRef, loadImageQuery] =
    useQueryLoader<BetaEditorQueryType>(BetaEditorQuery);

  // Load image data
  useEffect(() => {
    loadImageQuery({ imageId });
  }, [loadImageQuery, imageId]);

  return (
    <Suspense fallback={<Loading />}>
      {imageQueryRef && <BetaEditor queryRef={imageQueryRef} />}
    </Suspense>
  );
};

export default BetaEditorLoader;
