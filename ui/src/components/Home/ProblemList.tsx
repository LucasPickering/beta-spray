import { Grid, Typography } from "@mui/material";
import React from "react";
import { graphql, useFragment } from "react-relay";
import ProblemCard from "./ProblemCard";
import BoulderImageUpload from "./BoulderImageUpload";
import { randomPhrase } from "util/func";
import { ProblemList_problemConnection$key } from "./__generated__/ProblemList_problemConnection.graphql";
import { ProblemList_deleteProblemMutation } from "./__generated__/ProblemList_deleteProblemMutation.graphql";
import { ProblemList_updateProblemMutation } from "./__generated__/ProblemList_updateProblemMutation.graphql";
import { ProblemList_createProblemMutation } from "./__generated__/ProblemList_createProblemMutation.graphql";
import useMutation from "util/useMutation";
import MutationError from "components/MutationError";

interface Props {
  problemConnectionKey: ProblemList_problemConnection$key;
}

const phraseGroups = [
  ["Up Up", "Monster", "Slab", "Crack", "Lateral"],
  ["Up", "And Away", "Sauce", "Joy", "Wolves", "Psoriasis"],
  // repetition => weighted odds
  [undefined, undefined, undefined, "2.0", "But Harder"],
];

const ProblemList: React.FC<Props> = ({ problemConnectionKey }) => {
  const problems = useFragment(
    graphql`
      fragment ProblemList_problemConnection on ProblemNodeConnection {
        __id
        edges {
          node {
            id
            ...ProblemCard_problemNode
          }
        }
      }
    `,
    problemConnectionKey
  );

  // For now, we enforce one problem per image, so auto-create the problem now
  const { commit: createProblem, state: createState } =
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
            ...ProblemCard_problemNode
          }
        }
      }
    `);

  const { commit: updateProblem, state: updateState } =
    useMutation<ProblemList_updateProblemMutation>(graphql`
      mutation ProblemList_updateProblemMutation(
        $input: UpdateProblemMutationInput!
      ) {
        updateProblem(input: $input) {
          problem {
            id
            ...ProblemCard_problemNode
          }
        }
      }
    `);

  const { commit: deleteProblem, state: deleteState } =
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
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography component="h2" variant="h4">
          Problems
        </Typography>
      </Grid>
      {problems.edges.map(({ node }) => (
        <Grid key={node.id} item xs={12} sm={6} md={4}>
          <ProblemCard
            problemKey={node}
            onEdit={(problemId, name) =>
              updateProblem({ variables: { input: { problemId, name } } })
            }
            onDelete={(problemId) =>
              deleteProblem({
                variables: {
                  input: { problemId },
                  connections: [problems.__id],
                },
              })
            }
          />
        </Grid>
      ))}

      <Grid item xs={12}>
        <BoulderImageUpload
          onUpload={(file) => {
            createProblem({
              variables: {
                input: {
                  name: randomPhrase(phraseGroups),
                  imageFile: "boulderImage",
                },
                connections: [problems.__id],
              },
              uploadables: {
                boulderImage: file,
              },
            });
          }}
        />
      </Grid>

      <MutationError message="Error uploading problem" state={createState} />
      <MutationError message="Error updating problem" state={updateState} />
      <MutationError message="Error deleting problem" state={deleteState} />
    </Grid>
  );
};

export default ProblemList;
