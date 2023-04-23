import { useEffect, useId } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaList_problemNode$key } from "./__generated__/BetaList_problemNode.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";
import { BetaList_deleteBetaMutation } from "./__generated__/BetaList_deleteBetaMutation.graphql";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import useMutation from "util/useMutation";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { problemQuery } from "../../../util/queries";
import { withQuery } from "relay-query-wrapper";
import {
  Button,
  FormControl,
  FormLabel,
  List,
  RadioGroup,
  Skeleton,
} from "@mui/material";
import { Add as IconAdd } from "@mui/icons-material";
import BetaListItem from "./BetaListItem";
import { BetaList_copyBetaMutation } from "./__generated__/BetaList_copyBetaMutation.graphql";
import { isDefined } from "util/func";
import { generateUniqueClientID } from "relay-runtime";
import { useOptimisiticUserFields } from "util/user";

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
        $input: CreateBetaInput!
        $connections: [ID!]!
      ) @raw_response_type {
        createBeta(input: $input)
          @appendNode(connections: $connections, edgeTypeName: "BetaNodeEdge") {
          id
          ...BetaListItem_betaNode
        }
      }
    `);
  const { commit: copyBeta, state: copyState } =
    useMutation<BetaList_copyBetaMutation>(graphql`
      mutation BetaList_copyBetaMutation(
        $input: CopyBetaInput!
        $connections: [ID!]!
      ) @raw_response_type {
        copyBeta(input: $input)
          @appendNode(connections: $connections, edgeTypeName: "BetaNodeEdge") {
          id
          ...BetaListItem_betaNode
        }
      }
    `);
  const { commit: deleteBeta, state: deleteState } =
    useMutation<BetaList_deleteBetaMutation>(graphql`
      mutation BetaList_deleteBetaMutation(
        $input: NodeInput!
        $connections: [ID!]!
      ) @raw_response_type {
        deleteBeta(input: $input) {
          id @deleteEdge(connections: $connections) @deleteRecord
        }
      }
    `);

  const optimisticUserFields = useOptimisiticUserFields();

  // Callbacks
  const onCreateNew = (): void => {
    createBeta({
      variables: {
        input: { problem: problem.id },
        connections,
      },
      optimisticResponse: {
        createBeta: {
          id: generateUniqueClientID(),
          name: "",
          ...optimisticUserFields,
        },
      },
      // Select the new beta after creation
      onCompleted(data) {
        if (data.createBeta) {
          onSelectBeta(data.createBeta.id);
        }
      },
    });
  };

  const onCopy = (betaId: string): void => {
    copyBeta({
      variables: { input: { id: betaId }, connections },
      optimisticResponse: {
        copyBeta: {
          id: generateUniqueClientID(),
          // We *could* use the source beta name here, but the placeholder
          // acts as a clear loading indicator
          name: "",
          ...optimisticUserFields,
          // Don't bother populating the moves here. We don't have access to
          // the full move data that's used in the SVG, so let's just wait until
          // we get the actual thing from the API
        },
      },
      // Select the new beta after creation
      onCompleted(data) {
        if (data.copyBeta) {
          onSelectBeta(data.copyBeta.id);
        }
      },
    });
  };
  const onDelete = (betaId: string): void => {
    deleteBeta({
      variables: { input: { id: betaId }, connections },
      optimisticResponse: {
        deleteBeta: {
          id: betaId,
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
        <List disablePadding>
          {problem.betas.edges.map(({ node }) => (
            <BetaListItem
              key={node.id}
              betaKey={node}
              onCopy={onCopy}
              onDelete={onDelete}
            />
          ))}
        </List>
      </RadioGroup>

      <MutationErrorSnackbar
        message="Error creating beta"
        state={createState}
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
