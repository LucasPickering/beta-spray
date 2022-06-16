import { Grid, Skeleton } from "@mui/material";
import React from "react";
import { graphql, useFragment } from "react-relay";
import ProblemCard from "./ProblemCard";
import BoulderImageUpload from "./BoulderImageUpload";
import { ProblemList_problemConnection$key } from "./__generated__/ProblemList_problemConnection.graphql";
import { ProblemList_deleteProblemMutation } from "./__generated__/ProblemList_deleteProblemMutation.graphql";
import { ProblemList_updateProblemMutation } from "./__generated__/ProblemList_updateProblemMutation.graphql";
import { ProblemList_createBoulderWithFriendsMutation } from "./__generated__/ProblemList_createBoulderWithFriendsMutation.graphql";
import useMutation from "util/useMutation";
import MutationError from "components/common/MutationError";
import { ProblemListQuery } from "./__generated__/ProblemListQuery.graphql";
import withQuery from "util/withQuery";
import { useNavigate } from "react-router-dom";

const cardSizes = { xs: 12, sm: 6, md: 4 };

interface Props {
  problemConnectionKey: ProblemList_problemConnection$key;
}

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

  const navigate = useNavigate();

  // For now, we enforce one problem per image, so auto-create the problem now
  const { commit: createBoulderWithFriends, state: createState } =
    useMutation<ProblemList_createBoulderWithFriendsMutation>(graphql`
      mutation ProblemList_createBoulderWithFriendsMutation(
        $input: CreateBoulderWithFriendsMutationInput!
        $connections: [ID!]!
      ) {
        createBoulderWithFriends(input: $input) {
          problem
            @prependNode(
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
            name
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
    <>
      <Grid item {...cardSizes}>
        <BoulderImageUpload
          onUpload={(file) => {
            createBoulderWithFriends({
              variables: {
                input: { imageFile: "boulderImage" },
                connections: [problems.__id],
              },
              uploadables: {
                boulderImage: file,
              },
              // Optimistically create the new problem
              // Unfortunately no static typing here, but Relay checks at runtime
              optimisticResponse: {
                createBoulderWithFriends: {
                  problem: {
                    id: "",
                    name: "",
                    createdAt: new Date(),
                    boulder: {
                      id: "",
                      // Card should detect empty URL and render a placeholder
                      image: {
                        url: "",
                      },
                    },
                  },
                },
              },
              // Redirect to the newly uploaded problem
              onCompleted(data) {
                // This shouldn't ever be null if the mutation succeeded
                if (data.createBoulderWithFriends) {
                  // TODO pre-load editor query
                  navigate(
                    `/problems/${data.createBoulderWithFriends.problem.id}`
                  );
                }
              },
            });
          }}
        />
      </Grid>

      {problems.edges.map(({ node }) => (
        <Grid key={node.id} item {...cardSizes}>
          <ProblemCard
            problemKey={node}
            onEdit={(problemId, name) =>
              updateProblem({
                variables: { input: { problemId, name } },
                optimisticResponse: {
                  updateProblem: {
                    problem: {
                      id: problemId,
                      name,
                    },
                  },
                },
              })
            }
            onDelete={(problemId) =>
              deleteProblem({
                variables: {
                  input: { problemId },
                  connections: [problems.__id],
                },
                optimisticResponse: {
                  deleteProblem: {
                    problem: { id: problemId },
                  },
                },
              })
            }
          />
        </Grid>
      ))}

      <MutationError message="Error uploading problem" state={createState} />
      <MutationError message="Error updating problem" state={updateState} />
      <MutationError message="Error deleting problem" state={deleteState} />
    </>
  );
};

export default withQuery<ProblemListQuery, Props>({
  query: graphql`
    query ProblemListQuery {
      problems {
        ...ProblemList_problemConnection
      }
    }
  `,
  dataToProps: (data) =>
    data.problems && { problemConnectionKey: data.problems },
  fallbackElement: (
    <Grid item {...cardSizes}>
      <Skeleton variant="rectangular" height={348} />
    </Grid>
  ),
})(ProblemList);
