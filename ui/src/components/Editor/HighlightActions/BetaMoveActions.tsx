import { useState } from "react";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { Delete as IconDelete, Edit as IconEdit } from "@mui/icons-material";
import { BetaMoveActions_deleteBetaMoveMutation } from "./__generated__/BetaMoveActions_deleteBetaMoveMutation.graphql";
import { isDefined } from "util/func";
import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "components/Editor/queries";
import { withQuery } from "relay-query-wrapper";
import { BetaMoveActions_betaNode$key } from "./__generated__/BetaMoveActions_betaNode.graphql";
import { useHighlightItem } from "components/Editor/util/highlight";
import EditAnnotationDialog from "./EditAnnotationDialog";
import { BetaMoveActions_updateBetaMoveMutation } from "./__generated__/BetaMoveActions_updateBetaMoveMutation.graphql";

interface Props {
  betaKey: BetaMoveActions_betaNode$key;
}

/**
 * Buttons for editing and deleting the highlighted beta move.
 *
 * This duplicates a lot from HoldActions, but IMO not enough to justify
 * the complicated abstraction needed to de-dupe that.
 */
const BetaMoveActions: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaMoveActions_betaNode on BetaNode {
        moves {
          edges {
            node {
              id
              order
              annotation
            }
          }
        }
      }
    `,
    betaKey
  );

  const [isEditing, setIsEditing] = useState(false);
  const [highlightedMove, highlightMove] = useHighlightItem("move", beta.moves);

  const { commit: updateBetaMove, state: updateState } =
    useMutation<BetaMoveActions_updateBetaMoveMutation>(graphql`
      mutation BetaMoveActions_updateBetaMoveMutation(
        $input: UpdateBetaMoveMutationInput!
      ) {
        updateBetaMove(input: $input) {
          betaMove {
            id
            annotation # The only field we modify
          }
        }
      }
    `);
  const { commit: deleteBetaMove, state: deleteState } =
    useMutation<BetaMoveActions_deleteBetaMoveMutation>(graphql`
      mutation BetaMoveActions_deleteBetaMoveMutation(
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

  const onClose = (): void => setIsEditing(false);

  // This gets rendered in the SVG context, so we need to portal out of that
  return (
    <>
      <SpeedDial ariaLabel="Beta move actions" icon={<SpeedDialIcon />}>
        <SpeedDialAction
          tooltipTitle="Delete Move"
          icon={<IconDelete />}
          onClick={() => {
            // This *should* always be defined, but hypothetically if someone
            // clicks the button while the element is being hidden, it could
            // trigger this so we need to guard for that
            if (isDefined(highlightedMove)) {
              deleteBetaMove({
                variables: {
                  input: { betaMoveId: highlightedMove.id },
                },
                // Reset selection to prevent ghost highlight
                onCompleted() {
                  highlightMove(undefined);
                },
                // Punting on optimisitic response for now
              });
            }
          }}
        />

        <SpeedDialAction
          tooltipTitle="Edit Notes"
          icon={<IconEdit />}
          onClick={() => setIsEditing(true)}
        />
      </SpeedDial>

      {/* Opened by the Edit button */}
      <EditAnnotationDialog
        open={isEditing}
        title={`Edit Notes for Move ${highlightedMove?.order}`}
        initialValue={highlightedMove?.annotation}
        onSave={(annotation) => {
          // This *shouldn't* ever be called while undefined
          if (highlightedMove) {
            updateBetaMove({
              variables: {
                input: { betaMoveId: highlightedMove.id, annotation },
              },
              optimisticResponse: {
                updateBetaMove: {
                  betaMove: { id: highlightedMove.id, annotation },
                },
              },
              onCompleted: onClose,
            });
          }
        }}
        onClose={onClose}
      />

      <MutationErrorSnackbar message="Error editing move" state={updateState} />
      <MutationErrorSnackbar
        message="Error deleting move"
        state={deleteState}
      />
    </>
  );
};

export default withQuery<queriesBetaQuery, Props, "betaKey">({
  query: betaQuery,
  dataToProps: (data) => data.beta && { betaKey: data.beta },
  // Don't show any actions until a beta is selected
  fallbackElement: null,
})(BetaMoveActions);
