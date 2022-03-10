import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import RadioList from "./RadioList";
import { ProblemList_createProblemMutation } from "./__generated__/ProblemList_createProblemMutation.graphql";
import { ProblemList_deleteProblemMutation } from "./__generated__/ProblemList_deleteProblemMutation.graphql";
import { ProblemList_imageNode$key } from "./__generated__/ProblemList_imageNode.graphql";

interface Props {
  imageKey: ProblemList_imageNode$key;
  selectedProblem: string | undefined;
  setSelectedProblem: (problemId: string) => void;
}

/**
 * List all problems for a boulder image
 */
const ProblemList: React.FC<Props> = ({
  imageKey,
  selectedProblem,
  setSelectedProblem,
}) => {
  const image = useFragment(
    graphql`
      fragment ProblemList_imageNode on BoulderImageNode {
        id
        problems {
          __id
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    imageKey
  );
  const connections = [image.problems.__id];

  // TODO handle loading states
  const [createProblem] =
    useMutation<ProblemList_createProblemMutation>(graphql`
      mutation ProblemList_createProblemMutation(
        $input: CreateProblemMutationInput!
        $connections: [ID!]!
      ) {
        createProblem(input: $input) {
          problem
            @appendNode(
              connections: $connections
              edgeTypeName: "ProblemNodeEdge"
            ) {
            id
            name
          }
        }
      }
    `);

  // TODO handle loading states
  const [deleteProblem] =
    useMutation<ProblemList_deleteProblemMutation>(graphql`
      mutation ProblemList_deleteProblemMutation(
        $input: DeleteProblemMutationInput!
        $connections: [ID!]!
      ) {
        deleteProblem(input: $input) {
          problem {
            id @deleteEdge(connections: $connections) @deleteRecord
          }
        }
      }
    `);

  return (
    <RadioList
      title="Problems"
      items={image.problems.edges.map(({ node }) => node)}
      selectedId={selectedProblem}
      setSelectedId={setSelectedProblem}
      onCreateNew={() =>
        createProblem({
          variables: {
            input: {
              imageId: image.id,
              name: `Problem ${image.problems.edges.length + 1}`,
            },
            connections,
          },
        })
      }
      onDelete={(id) =>
        deleteProblem({
          variables: { input: { problemId: id }, connections },
        })
      }
    />
  );
};

export default ProblemList;
