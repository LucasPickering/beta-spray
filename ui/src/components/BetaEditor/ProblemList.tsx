import React from "react";
import { graphql, useFragment } from "react-relay";
import { ProblemList_image$key } from "./__generated__/ProblemList_image.graphql";

interface Props {
  imageKey: ProblemList_image$key;
  selectedProblem: string | undefined;
}

const ProblemList: React.FC<Props> = ({ imageKey, selectedProblem }) => {
  const data = useFragment(
    graphql`
      fragment ProblemList_image on BoulderImageNode {
        problems {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
    imageKey
  );

  return (
    <ul>
      {data.problems.edges.map(({ node }) => (
        <li key={node.id}>{node.id}</li>
      ))}{" "}
    </ul>
  );
};

export default ProblemList;
