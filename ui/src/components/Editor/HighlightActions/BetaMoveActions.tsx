import { useState } from "react";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { BetaMoveActions_deleteBetaMoveMutation } from "./__generated__/BetaMoveActions_deleteBetaMoveMutation.graphql";
import { isDefined } from "util/func";
import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { betaQuery } from "components/Editor/queries";
import { withQuery } from "relay-query-wrapper";
import { BetaMoveActions_betaNode$key } from "./__generated__/BetaMoveActions_betaNode.graphql";
import { useHighlightItem } from "components/Editor/util/highlight";
import { BetaMoveActions_updateBetaMoveMutation } from "./__generated__/BetaMoveActions_updateBetaMoveMutation.graphql";
import { deleteBetaMoveLocal } from "../util/moves";
import ActionButtons from "./ActionButtons";

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
        id
        moves {
          edges {
            node {
              id
              order
              isStart
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
        $input: UpdateBetaMoveInput!
      ) {
        updateBetaMove(input: $input) {
          id
          annotation # The only field we modify
        }
      }
    `);
  const { commit: deleteBetaMove, state: deleteState } =
    useMutation<BetaMoveActions_deleteBetaMoveMutation>(graphql`
      mutation BetaMoveActions_deleteBetaMoveMutation($input: NodeInput!) {
        deleteBetaMove(input: $input) {
          # This can reorder moves, so we have to refetch the whole move list
          beta {
            id
            moves {
              totalCount
              edges {
                node {
                  id
                  # These are the fields that can change after a delete
                  order
                  isStart
                }
              }
            }
          }
        }
      }
    `);

  const onOpen = (): void => setIsEditing(true);
  const onClose = (): void => setIsEditing(false);

  // This gets rendered in the SVG context, so we need to portal out of that
  return (
    <>
      <ActionButtons
        noun="Hold"
        editingAnnotation={isEditing}
        annotation={highlightedMove?.annotation}
        onEditAnnotation={onOpen}
        onCloseAnnotation={onClose}
        onSaveAnnotation={(annotation) => {
          // This *shouldn't* ever be called while undefined
          if (highlightedMove) {
            updateBetaMove({
              variables: {
                input: { id: highlightedMove.id, annotation },
              },
              optimisticResponse: {
                updateBetaMove: {
                  id: highlightedMove.id,
                  annotation,
                },
              },
              onCompleted: onClose,
            });
          }
        }}
        onDelete={() => {
          // This *should* always be defined, but hypothetically if someone
          // clicks the button while the element is being hidden, it could
          // trigger this so we need to guard for that
          if (isDefined(highlightedMove)) {
            const betaMoveId = highlightedMove.id;
            deleteBetaMove({
              variables: {
                input: { id: betaMoveId },
              },
              // Reset selection to prevent ghost highlight
              onCompleted() {
                highlightMove(undefined);
              },
              optimisticResponse: {
                deleteBetaMove: {
                  id: betaMoveId,
                  beta: {
                    id: beta.id,
                    moves: deleteBetaMoveLocal(beta.moves, betaMoveId),
                  },
                },
              },
            });
          }
        }}
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
  // Generally this shouldn't be rendered until the beta is loaded, because
  // there's no way to highlight a move until then. But let's include this to
  // be safe
  fallbackElement: <ActionButtons noun="Move" disabled />,
})(BetaMoveActions);
