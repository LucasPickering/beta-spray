import React, { useContext, useEffect } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaList_problemNode$key } from "./__generated__/BetaList_problemNode.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";
import { BetaList_deleteBetaMutation } from "./__generated__/BetaList_deleteBetaMutation.graphql";
import RadioList from "./RadioList";
import { EditorContext } from "util/context";
import MutationError from "components/common/MutationError";
import useMutation from "util/useMutation";
import { queriesEditorQuery } from "../__generated__/queriesEditorQuery.graphql";
import { editorQuery } from "../queries";
import withQuery from "util/withQuery";
import { Skeleton } from "@mui/material";

interface Props {
  problemKey: BetaList_problemNode$key;
}

/**
 * List all the betas for a problem
 */
const BetaList: React.FC<Props> = ({ problemKey }) => {
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
  const { selectedBeta, setSelectedBeta, editingHolds } =
    useContext(EditorContext);

  // Auto-select the first beta if nothing else is selected
  useEffect(() => {
    if (!selectedBeta && problem.betas.edges.length > 0) {
      setSelectedBeta(problem.betas.edges[0].node.id);
    }
  }, [selectedBeta, setSelectedBeta, problem.betas.edges]);

  const { commit: createBeta, state: createState } =
    useMutation<BetaList_createBetaMutation>(graphql`
      mutation BetaList_createBetaMutation(
        $input: CreateBetaMutationInput!
        $connections: [ID!]!
      ) {
        createBeta(input: $input) {
          beta
            @appendNode(
              connections: $connections
              edgeTypeName: "BetaNodeEdge"
            ) {
            # This should match the fragment above
            id
            name
            moves {
              edges {
                cursor
              }
            }
          }
        }
      }
    `);
  const { commit: deleteBeta, state: deleteState } =
    useMutation<BetaList_deleteBetaMutation>(graphql`
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
    <>
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
        onCreateNew={() => {
          createBeta({
            variables: {
              input: {
                problemId: problem.id,
              },
              connections,
            },
            // Unfortunately no static typing here, but Relay checks at runtime
            optimisticResponse: {
              createBeta: {
                beta: {
                  id: "",
                  name: "",
                  moves: { edges: [] },
                },
              },
            },
            // Select the new beta after creation
            onCompleted(data) {
              if (data.createBeta) {
                setSelectedBeta(data.createBeta.beta.id);
              }
            },
          });
        }}
        onDelete={(betaId) =>
          deleteBeta({
            variables: { input: { betaId }, connections },
            optimisticResponse: {
              deleteBeta: {
                beta: { id: betaId },
              },
            },
            onCompleted() {
              // If the selected beta was deleted, unselect it
              if (selectedBeta === betaId) {
                setSelectedBeta(undefined);
              }
            },
          })
        }
      />

      <MutationError message="Error creating beta" state={createState} />
      <MutationError message="Error deleting beta" state={deleteState} />
    </>
  );
};

export default withQuery<queriesEditorQuery, Props>({
  query: editorQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: <Skeleton variant="rectangular" height={100} />,
})(BetaList);
