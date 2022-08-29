import { IconButton, Tooltip } from "@mui/material";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import React from "react";
import { graphql, useFragment } from "react-relay";
import useMutation from "util/useMutation";
import { Delete as IconDelete } from "@mui/icons-material";
import { ItemTrashCan_deleteBetaMoveMutation } from "./__generated__/ItemTrashCan_deleteBetaMoveMutation.graphql";
import { getItemWithKind, useDrop } from "util/dnd";
import { ItemTrashCan_deleteHoldMutation } from "./__generated__/ItemTrashCan_deleteHoldMutation.graphql";
import { ItemTrashCan_problemNode$key } from "./__generated__/ItemTrashCan_problemNode.graphql";
import { problemQuery } from "../queries";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import withQuery from "util/withQuery";

interface Props {
  problemKey: ItemTrashCan_problemNode$key;
}

/**
 * A button in the palette, which the user can drop things onto.
 */
export const ItemTrashCan: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment ItemTrashCan_problemNode on ProblemNode {
        holds {
          __id
        }
      }
    `,
    problemKey
  );

  const { commit: deleteHold, state: deleteHoldState } =
    useMutation<ItemTrashCan_deleteHoldMutation>(graphql`
      mutation ItemTrashCan_deleteHoldMutation(
        $input: DeleteHoldMutationInput!
        $connections: [ID!]!
      ) {
        deleteHold(input: $input) {
          hold {
            id @deleteEdge(connections: $connections) @deleteRecord
          }
        }
      }
    `);
  const { commit: deleteBetaMove, state: deleteBetaMoveState } =
    useMutation<ItemTrashCan_deleteBetaMoveMutation>(graphql`
      mutation ItemTrashCan_deleteBetaMoveMutation(
        $input: DeleteBetaMoveMutationInput!
      ) {
        deleteBetaMove(input: $input) {
          betaMove {
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);

  const [, drop] = useDrop({
    accept: ["overlayBetaMove", "overlayHold"],
    drop(_, monitor) {
      // Use helper function to get kind+item, so we can use variant guards
      const { kind, item } = getItemWithKind(monitor);
      switch (kind) {
        case "overlayHold": {
          if (item.action === "relocate") {
            deleteHold({
              variables: {
                input: { holdId: item.holdId },
                // Delete from everywhere possible
                connections: [problem.holds.__id],
              },
              optimisticResponse: {
                deleteHold: {
                  hold: { id: item.holdId },
                },
              },
            });
          }
          break;
        }
        case "overlayBetaMove": {
          if (item.action === "relocate" || item.action === "insertAfter") {
            deleteBetaMove({
              variables: { input: { betaMoveId: item.betaMoveId } },
              // Punting on optimistic update because ordering is hard.
            });
          }
          break;
        }
      }

      return { kind: "trash" };
    },
  });

  return (
    <>
      <Tooltip title="Drag Here to Delete">
        <IconButton ref={drop} component="span" color="error" size="large">
          <IconDelete />
        </IconButton>
      </Tooltip>

      <MutationErrorSnackbar
        message="Error deleting hold"
        state={deleteHoldState}
      />
      <MutationErrorSnackbar
        message="Error deleting move"
        state={deleteBetaMoveState}
      />
    </>
  );
};

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: null,
})(ItemTrashCan);
