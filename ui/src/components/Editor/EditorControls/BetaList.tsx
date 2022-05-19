import React, { useContext, useEffect } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaList_problemNode$key } from "./__generated__/BetaList_problemNode.graphql";
import { BetaList_createBetaMutation } from "./__generated__/BetaList_createBetaMutation.graphql";
import { BetaList_deleteBetaMutation } from "./__generated__/BetaList_deleteBetaMutation.graphql";
import { EditorContext } from "util/context";
import MutationError from "components/common/MutationError";
import useMutation from "util/useMutation";
import { queriesEditorQuery } from "../__generated__/queriesEditorQuery.graphql";
import { editorQuery } from "../queries";
import withQuery from "util/withQuery";
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
              ...BetaListItem_betaNode
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
            id
            ...BetaListItem_betaNode
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
          setSelectedBeta(data.createBeta.beta.id);
        }
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
          setSelectedBeta(data.copyBeta.beta.id);
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
          setSelectedBeta(undefined);
        }
      },
    });
  };

  const labelId = `beta-select`;
  const disabled = editingHolds;
  return (
    <>
      <FormControl>
        <FormLabel id={labelId}>Beta</FormLabel>

        <RadioGroup
          aria-labelledby={labelId}
          // `undefined` makes the group think it's in uncontrolled state
          value={selectedBeta ?? null}
          onChange={(e) => setSelectedBeta(e.target.value)}
          sx={{ marginTop: 1, marginBottom: 1 }}
        >
          <Stack direction="column">
            {problem.betas.edges.map(({ node }) => (
              <BetaListItem
                key={node.id}
                betaKey={node}
                disabled={disabled}
                onCopy={onCopy}
                onDelete={onDelete}
              />
            ))}
          </Stack>
        </RadioGroup>

        <Button
          size="small"
          variant="outlined"
          startIcon={<IconAdd />}
          disabled={disabled}
          onClick={() => onCreateNew()}
          sx={{ width: "100%" }}
        >
          Add
        </Button>
      </FormControl>

      <MutationError message="Error creating beta" state={createState} />
      <MutationError message="Error copying beta" state={copyState} />
      <MutationError message="Error deleting beta" state={deleteState} />
    </>
  );
};

export default withQuery<queriesEditorQuery, Props>({
  query: editorQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: <Skeleton variant="rectangular" height={100} />,
})(BetaList);
