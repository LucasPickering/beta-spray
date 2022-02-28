import React from "react";
import { graphql, useFragment } from "react-relay";
import { Box } from "rebass";
import { Label, Radio } from "@rebass/forms";
import { ProblemList_image$key } from "./__generated__/ProblemList_image.graphql";

interface Props {
  imageKey: ProblemList_image$key;
  selectedProblem: string | undefined;
  setSelectedProblem: (problemId: string) => void;
}

const ProblemList: React.FC<Props> = ({
  imageKey,
  selectedProblem,
  setSelectedProblem,
}) => {
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
    <div>
      {data.problems.edges.map(({ node }, i) => (
        <Box key={node.id}>
          <Label htmlFor={`problem-${node.id}`}>
            <Radio
              id={`problem-${node.id}`}
              value={selectedProblem}
              checked={selectedProblem === node.id}
              onChange={() => setSelectedProblem(node.id)}
            />
            Problem {i + 1}
          </Label>
        </Box>
      ))}
    </div>
  );
};

export default ProblemList;
