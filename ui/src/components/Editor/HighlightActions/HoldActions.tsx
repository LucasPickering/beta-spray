import { Fab } from "@mui/material";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { Delete as IconDelete } from "@mui/icons-material";
import { HoldActions_deleteHoldMutation } from "./__generated__/HoldActions_deleteHoldMutation.graphql";
import { isDefined } from "util/func";
import { useHighlight } from "components/Editor/util/highlight";
import { HoldActions_problemNode$key } from "./__generated__/HoldActions_problemNode.graphql";
import { withQuery } from "relay-query-wrapper";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import { problemQuery } from "../queries";

interface Props {
  problemKey: HoldActions_problemNode$key;
}

/**
 * Buttons for editing and deleting the highlighted hold.
 */
const HoldActions: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment HoldActions_problemNode on ProblemNode {
        holds {
          # Needed to delete holds from the connection
          __id
        }
      }
    `,
    problemKey
  );

  const [highlightedHoldId, highlightHold] = useHighlight("hold");
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

  // This gets rendered in the SVG context, so we need to portal out of that
  return (
    <>
      <Fab
        color="primary"
        onClick={() => {
          // This *should* always be defined, but hypothetically if someone
          // clicks the button while the element is being hidden, it could
          // trigger this so we need to guard for that
          if (isDefined(highlightedHoldId)) {
            deleteHold({
              variables: {
                input: { holdId: highlightedHoldId },
                // TODO do we need to pass beta.holds here too?
                connections: [problem.holds.__id],
              },
              // Reset selection to prevent ghost highlight
              onCompleted() {
                highlightHold(undefined);
              },
              optimisticResponse: {
                deleteHold: { hold: { id: highlightedHoldId } },
              },
            });
          }
        }}
      >
        <IconDelete />
      </Fab>

      <MutationErrorSnackbar
        message="Error deleting move"
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
