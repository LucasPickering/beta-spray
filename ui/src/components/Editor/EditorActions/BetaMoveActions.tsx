import { useContext, useState } from "react";
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { Delete as IconDelete, Edit as IconEdit } from "@mui/icons-material";
import { EditorHighlightedMoveContext } from "util/context";
import { BetaMoveActions_deleteBetaMoveMutation } from "./__generated__/BetaMoveActions_deleteBetaMoveMutation.graphql";
import { isDefined } from "util/func";
import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "components/Editor/queries";
import EditBetaMoveDialog from "./EditBetaMoveDialog";
import { withQuery } from "relay-query-wrapper";
import { BetaMoveActions_betaNode$key } from "./__generated__/BetaMoveActions_betaNode.graphql";

interface Props {
  betaKey: BetaMoveActions_betaNode$key;
}

/**
 * Buttons for editing and deleting the highlighted beta move.
 */
const BetaMoveActions: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaMoveActions_betaNode on BetaNode {
        moves {
          ...EditBetaMoveDialog_betaMoveConnection
        }
      }
    `,
    betaKey
  );

  const [highlightedMoveId, setHighlightedMoveId] = useContext(
    EditorHighlightedMoveContext
  );
  const [isEditing, setIsEditing] = useState(false);
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
            if (isDefined(highlightedMoveId)) {
              deleteBetaMove({
                variables: { input: { betaMoveId: highlightedMoveId } },
                // Reset selection to prevent ghost highlight
                onCompleted() {
                  setHighlightedMoveId(undefined);
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
      <EditBetaMoveDialog
        betaMoveConnectionKey={beta.moves}
        open={isEditing}
        onClose={() => setIsEditing(false)}
      />
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
