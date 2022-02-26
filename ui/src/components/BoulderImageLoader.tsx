import React, { Suspense, useEffect } from "react";
import { useQueryLoader } from "react-relay";
import { useParams } from "react-router-dom";
import { assertIsDefined } from "util/func";
import BoulderImage from "./BoulderImage";
import Loading from "./Loading";
import { BoulderImageQuery as BoulderImageQueryType } from "./__generated__/BoulderImageQuery.graphql";
import BoulderImageQuery from "./__generated__/BoulderImageQuery.graphql";

const BoulderImageLoader: React.FC = () => {
  const { imageId } = useParams();
  assertIsDefined(imageId); // Only undefined if routing isn't hooked up right

  const [imageQueryRef, loadImageQuery] =
    useQueryLoader<BoulderImageQueryType>(BoulderImageQuery);

  // Load image data
  useEffect(() => {
    loadImageQuery({ imageId });
  }, [loadImageQuery, imageId]);

  return (
    <Suspense fallback={<Loading />}>
      {imageQueryRef && <BoulderImage queryRef={imageQueryRef} />}
    </Suspense>
  );
};

export default BoulderImageLoader;
