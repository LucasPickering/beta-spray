import React from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { BetaList_problemNode$key } from "./__generated__/BetaList_problemNode.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";
import { BetaList_deleteBetaMutation } from "./__generated__/BetaList_deleteBetaMutation.graphql";
import RadioList from "./RadioList";
import { randomPhrase } from "util/func";

interface Props {
  problemKey: BetaList_problemNode$key;
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string) => void;
}

const phraseGroups = [
  ["Simply", "Just", "You", "All you have to do is"],
  [
    "Hang On",
    "Don't Let Go",
    "Don't Fall",
    "Send It",
    "Squeeze Harder",
    "Be Taller",
    "Don't Be Short?",
    "Grow 6 Inches",
  ],
];

/**
 * List all the betas for a problem
 */
const BetaList: React.FC<Props> = ({
  problemKey,
  selectedBeta,
  setSelectedBeta,
}) => {
  const problem = useFragment(
    graphql`
      fragment BetaList_problemNode on ProblemNode {
        id
        betas {
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
    problemKey
  );
  const connections = [problem.betas.__id];

  // TODO handle loading states
  const [createBeta] = useMutation<BetaList_createBetaMutation>(graphql`
    mutation BetaList_createBetaMutation(
      $input: CreateBetaMutationInput!
      $connections: [ID!]!
    ) {
      createBeta(input: $input) {
        beta
          @appendNode(connections: $connections, edgeTypeName: "BetaNodeEdge") {
          id
          name
        }
      }
    }
  `);

  // TODO handle loading states
  const [deleteBeta] = useMutation<BetaList_deleteBetaMutation>(graphql`
    mutation BetaList_deleteBetaMutation(
      $input: DeleteBetaMutationInput!
      $connections: [ID!]!
    ) {
      deleteBeta(input: $input) {
        beta {
          id @deleteEdge(connections: $connections) @deleteRecord
        }
      }
    }
  `);

  return (
    <RadioList
      title="Beta"
      items={problem.betas.edges.map(({ node }) => node)}
      selectedId={selectedBeta}
      setSelectedId={setSelectedBeta}
      onCreateNew={() =>
        createBeta({
          variables: {
            input: {
              problemId: problem.id,
              name: randomPhrase(
                phraseGroups,
                // Exclude existing names
                problem.betas.edges.map(({ node }) => node.name)
              ),
            },
            connections,
          },
        })
      }
      onDelete={(id) =>
        deleteBeta({
          variables: { input: { betaId: id }, connections },
        })
      }
    />
  );
};

export default BetaList;
