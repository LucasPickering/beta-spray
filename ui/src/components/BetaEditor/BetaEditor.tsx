import React, { useState } from "react";
import { PreloadedQuery, usePreloadedQuery } from "react-relay";
import { Flex } from "rebass";
import { graphql } from "relay-runtime";
import NotFound from "../NotFound";
import BoulderImage from "./BoulderImage";
import ProblemList from "./ProblemList";
import { BetaEditorQuery } from "./__generated__/BetaEditorQuery.graphql";

interface Props {
  queryRef: PreloadedQuery<BetaEditorQuery>;
}

const BetaEditor: React.FC<Props> = ({ queryRef }) => {
  const data = usePreloadedQuery<BetaEditorQuery>(
    graphql`
      query BetaEditorQuery($imageId: ID!) {
        image(id: $imageId) {
          ...BoulderImage_image
          ...ProblemList_image
        }
      }
    `,
    queryRef
  );
  const [selectedProblem, setSelectedProblem] = useState<string | undefined>();

  if (!data.image) {
    return <NotFound />;
  }

  return (
    <Flex>
      <BoulderImage imageKey={data.image} />
      <ProblemList imageKey={data.image} />
    </Flex>
  );
};

export default BetaEditor;
