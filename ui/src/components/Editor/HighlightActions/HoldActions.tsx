import { SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { Delete as IconDelete } from "@mui/icons-material";
import { HoldActions_deleteHoldMutation } from "./__generated__/HoldActions_deleteHoldMutation.graphql";
import { isDefined } from "util/func";
import { useHighlightItem } from "components/Editor/util/highlight";
import { HoldActions_problemNode$key } from "./__generated__/HoldActions_problemNode.graphql";
import { withQuery } from "relay-query-wrapper";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { problemQuery } from "../queries";
import { Edit as IconEdit } from "@mui/icons-material";
import EditAnnotationDialog from "./EditAnnotationDialog";
import { useState } from "react";
import { HoldActions_updateHoldMutation } from "./__generated__/HoldActions_updateHoldMutation.graphql";

interface Props {
  problemKey: HoldActions_problemNode$key;
}

/**
 * Buttons for editing and deleting the highlighted hold.
 *
 * This duplicates a lot from BetaMoveActions, but IMO not enough to justify
 * the complicated abstraction needed to de-dupe that.
 */
const HoldActions: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment HoldActions_problemNode on ProblemNode {
        holds {
          # Needed to delete holds from the connection
          __id
          edges {
            node {
              id
              annotation
            }
          }
        }
      }
    `,
    problemKey
  );

  const [isEditing, setIsEditing] = useState(false);

  const [highlightedHold, highlightHold] = useHighlightItem(
    "hold",
    problem.holds
  );

  const { commit: updateHold, state: updateState } =
    useMutation<HoldActions_updateHoldMutation>(graphql`
      mutation HoldActions_updateHoldMutation(
        $input: UpdateHoldMutationInput!
      ) {
        updateHold(input: $input) {
          hold {
            id
            annotation
          }
        }
      }
    `);
  const { commit: deleteHold, state: deleteState } =
    useMutation<HoldActions_deleteHoldMutation>(graphql`
      mutation HoldActions_deleteHoldMutation(
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

  const onClose = (): void => setIsEditing(false);

  // This gets rendered in the SVG context, so we need to portal out of that
  return (
    <>
      <SpeedDial ariaLabel="Hold actions" icon={<SpeedDialIcon />}>
        <SpeedDialAction
          tooltipTitle="Delete Hold"
          icon={<IconDelete />}
          onClick={() => {
            // This *should* always be defined, but hypothetically if someone
            // clicks the button while the element is being hidden, it could
            // trigger this so we need to guard for that
            if (isDefined(highlightedHold)) {
              deleteHold({
                variables: {
                  input: { holdId: highlightedHold.id },
                  connections: [problem.holds.__id],
                },
                // Reset selection to prevent ghost highlight
                onCompleted() {
                  highlightHold(undefined);
                },
                optimisticResponse: {
                  deleteHold: { hold: { id: highlightedHold.id } },
                },
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
        title="Edit Notes for Hold"
        initialValue={highlightedHold?.annotation}
        onSave={(annotation) => {
          // This *shouldn't* ever be called while undefined
          if (highlightedHold) {
            updateHold({
              variables: {
                input: { holdId: highlightedHold.id, annotation },
              },
              optimisticResponse: {
                updateHold: { hold: { id: highlightedHold.id, annotation } },
              },
              onCompleted: onClose,
            });
          }
        }}
        onClose={onClose}
      />

      <MutationErrorSnackbar message="Error editing hold" state={updateState} />
      <MutationErrorSnackbar
        message="Error deleting hold"
        state={deleteState}
      />
    </>
  );
};

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  // Don't show any actions until a beta is selected
  fallbackElement: null,
})(HoldActions);
