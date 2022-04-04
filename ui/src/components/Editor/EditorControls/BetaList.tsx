import React, { useContext, useEffect } from "react";
import { graphql, useFragment, useMutation } from "react-relay";
import { BetaList_problemNode$key } from "./__generated__/BetaList_problemNode.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";
import { BetaList_deleteBetaMutation } from "./__generated__/BetaList_deleteBetaMutation.graphql";
import RadioList from "./RadioList";
import { randomPhrase } from "util/func";
import EditorContext from "context/EditorContext";

interface Props {
  problemKey: BetaList_problemNode$key;
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string | undefined) => void;
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
              # TODO get length directly from connection
              moves {
                edges {
                  cursor
                }
              }
            }
          }
        }
      }
    `,
    problemKey
  );
  const connections = [problem.betas.__id];
  const { editingHolds } = useContext(EditorContext);

  // Auto-select the first beta if nothing else is selected
  useEffect(() => {
    if (!selectedBeta && problem.betas.edges.length > 0) {
      setSelectedBeta(problem.betas.edges[0].node.id);
    }
  }, [selectedBeta, setSelectedBeta, problem.betas.edges]);

  // TODO handle loading states
  const [createBeta] = useMutation<BetaList_createBetaMutation>(graphql`
    mutation BetaList_createBetaMutation(
      $input: CreateBetaMutationInput!
      $connections: [ID!]!
    ) {
      createBeta(input: $input) {
        beta
          @appendNode(connections: $connections, edgeTypeName: "BetaNodeEdge") {
          # This should match the fragment above
          id
          name
          # TODO get length directly from connection
          moves {
            edges {
              cursor
            }
          }
        }
      }
    }
  `);
  // TODO un-select current beta if it's deleted
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
      items={problem.betas.edges.map(({ node }) => ({
        id: node.id,
        name: node.name,
        subtitle: `${node.moves.edges.length} moves`,
      }))}
      disabled={editingHolds}
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
          onCompleted: () => {
            // If the selected beta was deleted, unselect it
            if (selectedBeta === id) {
              setSelectedBeta(undefined);
            }
          },
        })
      }
      sx={{ width: 240 }}
    />
  );
};

export default BetaList;