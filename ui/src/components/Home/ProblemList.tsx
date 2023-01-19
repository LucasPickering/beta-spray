import { Button, Grid, GridProps, Skeleton } from "@mui/material";
import { graphql, usePaginationFragment } from "react-relay";
import ProblemCard from "./ProblemCard";
import BoulderImageUpload from "./BoulderImageUpload";
import { ProblemList_query$key } from "./__generated__/ProblemList_query.graphql";
import { ProblemList_deleteProblemMutation } from "./__generated__/ProblemList_deleteProblemMutation.graphql";
import { ProblemList_updateProblemMutation } from "./__generated__/ProblemList_updateProblemMutation.graphql";
import { ProblemList_createBoulderWithFriendsMutation } from "./__generated__/ProblemList_createBoulderWithFriendsMutation.graphql";
import useMutation from "util/useMutation";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import ProblemListQuery, {
  ProblemListQuery as ProblemListQueryType,
} from "./__generated__/ProblemListQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { useNavigate } from "react-router-dom";

interface Props {
  queryKey: ProblemList_query$key;
}

const ProblemList: React.FC<Props> = ({ queryKey }) => {
  const { data, loadNext, hasNext } = usePaginationFragment<
    ProblemListQueryType,
    ProblemList_query$key
  >(
    graphql`
      fragment ProblemList_query on Query
      @refetchable(queryName: "ProblemListQuery") {
        problems(first: $count, after: $cursor)
          @connection(key: "ProblemList_query_problems") {
          __id
          edges {
            node {
              id
              ...ProblemCard_problemNode
            }
          }
        }
      }
    `,
    queryKey
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
          beta {
            id
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
            externalLink
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

  if (!data?.problems) {
    return null;
  }

  const { problems } = data;

  return (
    <>
      <ProblemListGridItem>
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
                      image: { url: "" },
                    },
                    betas: { edges: [] },
                  },
                  beta: { id: "" },
                },
              },
              // Redirect to the newly uploaded problem
              onCompleted(data) {
                // This shouldn't ever be null if the mutation succeeded
                if (data.createBoulderWithFriends) {
                  const { problem, beta } = data.createBoulderWithFriends;
                  // Pre-select the created beta, to avoid waterfalled requests
                  navigate(`/problems/${problem.id}/beta/${beta.id}`);
                }
              },
            });
          }}
        />
      </ProblemListGridItem>

      {data.problems.edges.map(({ node }) => (
        <ProblemListGridItem key={node.id}>
          <ProblemCard
            problemKey={node}
            onSaveChanges={({ problemId, name, externalLink }) =>
              updateProblem({
                variables: { input: { problemId, name, externalLink } },
                optimisticResponse: {
                  updateProblem: {
                    problem: { id: problemId, name, externalLink },
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
        </ProblemListGridItem>
      ))}

      {hasNext ? (
        <Grid item xs={12}>
          <Button fullWidth onClick={() => loadNext(10)}>
            Load More
          </Button>
        </Grid>
      ) : null}

      <MutationErrorSnackbar
        message="Error uploading problem"
        state={createState}
      />
      <MutationErrorSnackbar
        message="Error updating problem"
        state={updateState}
      />
      <MutationErrorSnackbar
        message="Error deleting problem"
        state={deleteState}
      />
    </>
  );
};

/**
 * Little helper for all the different items that can appear in the grid, since
 * they're all the same size.
 */
const ProblemListGridItem: React.FC<GridProps> = (props) => (
  <Grid item xs={12} sm={6} md={4} {...props} />
);

const ProblemListPlaceholder: React.FC = () => (
  <ProblemListGridItem>
    <Skeleton variant="rectangular" height={348} />
  </ProblemListGridItem>
);

export default withQuery<ProblemListQueryType, Props>({
  // This query is auto-generated by the @refetchable directive above
  query: ProblemListQuery,
  dataToProps: (data) => ({ queryKey: data }),
  fallbackElement: (
    <>
      <ProblemListPlaceholder />
      <ProblemListPlaceholder />
      <ProblemListPlaceholder />
    </>
  ),
})(ProblemList);
