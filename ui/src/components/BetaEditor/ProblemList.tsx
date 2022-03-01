import React from "react";
import { graphql, useFragment } from "react-relay";
import { Box } from "rebass";
import { Label, Radio } from "@rebass/forms";
import { ProblemList_problemConnection$key } from "./__generated__/ProblemList_problemConnection.graphql";

interface Props {
  dataKey: ProblemList_problemConnection$key;
  selectedProblem: string | undefined;
  setSelectedProblem: (problemId: string) => void;
}

/**
 * Selection list of problems
 */
const ProblemList: React.FC<Props> = ({
  dataKey,
  selectedProblem,
  setSelectedProblem,
}) => {
  const data = useFragment(
    graphql`
      fragment ProblemList_problemConnection on ProblemNodeConnection {
        edges {
          node {
            id
          }
        }
      }
    `,
    dataKey
  );

  return (
    <div>
      {data.edges.map(({ node }, i) => (
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
