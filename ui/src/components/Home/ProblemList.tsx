import { Button, Grid, GridProps, Skeleton } from "@mui/material";
import { graphql, usePaginationFragment } from "react-relay";
import ProblemCard from "./ProblemCard";
import BoulderImageUpload from "./BoulderImageUpload";
import { ProblemList_query$key } from "./__generated__/ProblemList_query.graphql";
import { ProblemList_deleteProblemMutation } from "./__generated__/ProblemList_deleteProblemMutation.graphql";
import { ProblemList_createBoulderWithFriendsMutation } from "./__generated__/ProblemList_createBoulderWithFriendsMutation.graphql";
import useMutation from "util/useMutation";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import ProblemListQuery, {
  ProblemListQuery as ProblemListQueryType,
} from "./__generated__/ProblemListQuery.graphql";
import { withQuery } from "relay-query-wrapper";
import { useNavigate } from "react-router-dom";
import { generateUniqueClientID } from "relay-runtime";

interface Props {
  queryKey: ProblemList_query$key;
}

const ProblemList: React.FC<Props> = ({ queryKey }) => {
  const {
    data: { problems },
    loadNext,
    hasNext,
  } = usePaginationFragment<ProblemListQueryType, ProblemList_query$key>(
    graphql`
      fragment ProblemList_query on Query
      @refetchable(queryName: "ProblemListQuery") {
        problems(first: $count, after: $cursor)
          @required(action: THROW)
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
        $input: CreateBoulderWithFriendsInput!
        $connections: [ID!]!
      ) {
        createBoulderWithFriends(input: $input) {
          id # Created beta is returned
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
  const { commit: deleteProblem, state: deleteState } =
    useMutation<ProblemList_deleteProblemMutation>(graphql`
      mutation ProblemList_deleteProblemMutation(
        $input: NodeInput!
        $connections: [ID!]!
      ) {
        deleteProblem(input: $input) {
          id @deleteEdge(connections: $connections) @deleteRecord
        }
      }
    `);

  return (
    <>
      <ProblemListGridItem>
        <BoulderImageUpload
          onUpload={(file) => {
            createBoulderWithFriends({
              variables: {
                // null is a placeholder for the file data, which will be
                // pulled from the request body and injected by the API
                input: { image: null },
                connections: [problems.__id],
              },
              uploadables: {
                // This has to match the variable path above
                ["input.image"]: file,
              },
              // Optimistically create the new problem
              // Unfortunately no static typing here, but Relay checks at runtime
              optimisticResponse: {
                createBoulderWithFriends: {
                  id: generateUniqueClientID(),
                  problem: {
                    id: generateUniqueClientID(),
                    name: null,
                    externalLink: null,
                    createdAt: new Date(),
                    boulder: {
                      id: generateUniqueClientID(),
                      // Card should detect empty URL and render a placeholder
                      image: { url: null },
                    },
                    betas: { edges: [] },
                  },
                },
              },
              // Redirect to the newly uploaded problem
              onCompleted(data) {
                // This shouldn't ever be null if the mutation succeeded
                if (data.createBoulderWithFriends) {
                  const { id: betaId, problem } = data.createBoulderWithFriends;
                  // Pre-select the created beta, to avoid waterfalled requests
                  navigate(`/problems/${problem.id}/beta/${betaId}`);
                }
              },
            });
          }}
        />
      </ProblemListGridItem>

      {problems.edges.map(({ node }) => (
        <ProblemListGridItem key={node.id}>
          <ProblemCard
            problemKey={node}
            onDelete={(problemId) =>
              deleteProblem({
                variables: {
                  input: { id: problemId },
                  connections: [problems.__id],
                },
                optimisticResponse: {
                  deleteProblem: { id: problemId },
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
