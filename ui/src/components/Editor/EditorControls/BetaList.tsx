import { useEffect, useId } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaList_problemNode$key } from "./__generated__/BetaList_problemNode.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";
import { BetaList_deleteBetaMutation } from "./__generated__/BetaList_deleteBetaMutation.graphql";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import useMutation from "util/useMutation";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { problemQuery } from "../queries";
import { withQuery } from "relay-query-wrapper";
import {
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  Skeleton,
  Stack,
} from "@mui/material";
import { Add as IconAdd } from "@mui/icons-material";
import BetaListItem from "./BetaListItem";
import { BetaList_copyBetaMutation } from "./__generated__/BetaList_copyBetaMutation.graphql";
import { BetaList_updateBetaMutation } from "./__generated__/BetaList_updateBetaMutation.graphql";
import { isDefined } from "util/func";

interface Props {
  problemKey: BetaList_problemNode$key;
  selectedBeta: string | undefined;
  onSelectBeta: (betaId: string | undefined) => void;
}

/**
 * List all the betas for a problem
 */
const BetaList: React.FC<Props> = ({
  problemKey,
  selectedBeta,
  onSelectBeta,
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
              ...BetaListItem_betaNode
            }
          }
        }
      }
    `,
    problemKey
  );
  const connections = [problem.betas.__id];

  const labelId = useId();

  // Auto-select the first beta if nothing else is selected
  useEffect(() => {
    if (!selectedBeta && problem.betas.edges.length > 0) {
      onSelectBeta(problem.betas.edges[0].node.id);
    }
  }, [selectedBeta, onSelectBeta, problem.betas.edges]);

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
            id
            ...BetaListItem_betaNode
          }
        }
      }
    `);
  const { commit: updateBeta, state: updateState } =
    useMutation<BetaList_updateBetaMutation>(graphql`
      mutation BetaList_updateBetaMutation(
        $input: UpdateBetaMutationInput!
        $connections: [ID!]!
      ) {
        updateBeta(input: $input) {
          beta
            @appendNode(
              connections: $connections
              edgeTypeName: "BetaNodeEdge"
            ) {
            id
            # Only refresh what we know could have changed
            name
          }
        }
      }
    `);
  const { commit: copyBeta, state: copyState } =
    useMutation<BetaList_copyBetaMutation>(graphql`
      mutation BetaList_copyBetaMutation(
        $input: CopyBetaMutationInput!
        $connections: [ID!]!
      ) {
        copyBeta(input: $input) {
          beta
            @appendNode(
              connections: $connections
              edgeTypeName: "BetaNodeEdge"
            ) {
            id
            ...BetaListItem_betaNode
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

  // Callbacks
  const onCreateNew = (): void => {
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
          onSelectBeta(data.createBeta.beta.id);
        }
      },
    });
  };
  const onRename = (betaId: string, newName: string): void => {
    updateBeta({
      variables: { input: { betaId, name: newName }, connections },
      optimisticResponse: {
        updateBeta: {
          beta: { id: betaId, name: newName },
        },
      },
    });
  };
  const onCopy = (betaId: string): void => {
    copyBeta({
      variables: { input: { betaId }, connections },
      optimisticResponse: {
        copyBeta: {
          beta: { id: "", name: "", moves: { edges: [] } },
        },
      },
      // Select the new beta after creation
      onCompleted(data) {
        if (data.copyBeta) {
          onSelectBeta(data.copyBeta.beta.id);
        }
      },
    });
  };
  const onDelete = (betaId: string): void => {
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
          onSelectBeta(undefined);
        }
      },
    });
  };

  return (
    <BetaListWrapper labelId={labelId} onClickAdd={() => onCreateNew()}>
      <RadioGroup
        aria-labelledby={labelId}
        // `undefined` makes the group think it's in uncontrolled state
        value={selectedBeta ?? null}
        onChange={(e) => onSelectBeta(e.target.value)}
      >
        <Stack direction="column">
          {problem.betas.edges.map(({ node }) => (
            <BetaListItem
              key={node.id}
              betaKey={node}
              onRename={onRename}
              onCopy={onCopy}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      </RadioGroup>

      <MutationErrorSnackbar
        message="Error creating beta"
        state={createState}
      />
      <MutationErrorSnackbar
        message="Error renaming beta"
        state={updateState}
      />
      <MutationErrorSnackbar message="Error copying beta" state={copyState} />
      <MutationErrorSnackbar
        message="Error deleting beta"
        state={deleteState}
      />
    </BetaListWrapper>
  );
};

/**
 * Wrapper with static content that allows for a fleshed out loading state.
 */
const BetaListWrapper: React.FC<{
  labelId?: string;
  onClickAdd?: React.MouseEventHandler<HTMLButtonElement>;
  children?: React.ReactNode;
}> = ({ labelId, onClickAdd, children }) => (
  <FormControl>
    <FormLabel id={labelId}>Beta</FormLabel>

    {children}

    <Button
      size="small"
      startIcon={<IconAdd />}
      onClick={onClickAdd}
      disabled={!isDefined(onClickAdd)} // No callback means button does nothing
      sx={{ width: "100%", marginTop: 1 }}
    >
      Add
    </Button>
  </FormControl>
);

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: (
    <BetaListWrapper>
      <Skeleton variant="rectangular" height={100} />
    </BetaListWrapper>
  ),
})(BetaList);
