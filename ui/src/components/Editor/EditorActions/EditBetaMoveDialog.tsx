import { FormEvent, useState } from "react";
import { Dialog, DialogContent, DialogTitle, TextField } from "@mui/material";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { EditBetaMoveDialog_updateBetaMoveMutation } from "./__generated__/EditBetaMoveDialog_updateBetaMoveMutation.graphql";
import { EditBetaMoveDialogContent_betaMoveNode$key } from "./__generated__/EditBetaMoveDialogContent_betaMoveNode.graphql";
import { EditBetaMoveDialog_betaMoveConnection$key } from "./__generated__/EditBetaMoveDialog_betaMoveConnection.graphql";
import useHighlight from "util/useHighlight";
import { findNode } from "util/func";

interface Props {
  betaMoveConnectionKey: EditBetaMoveDialog_betaMoveConnection$key;
  open: boolean;
  onClose?: () => void;
}

/**
 * Outer edit modal. Rendered at all times, but only open when a move is
 * selected (to allow for open/closing animations).
 */
const EditBetaMoveDialog: React.FC<Props> = ({
  betaMoveConnectionKey,
  open,
  onClose,
}) => {
  const betaMoveConnection = useFragment(
    graphql`
      fragment EditBetaMoveDialog_betaMoveConnection on BetaMoveNodeConnection {
        edges {
          node {
            id
            order
            ...EditBetaMoveDialogContent_betaMoveNode
          }
        }
      }
    `,
    betaMoveConnectionKey
  );
  const { commit: updateBetaMove, state: updateState } =
    useMutation<EditBetaMoveDialog_updateBetaMoveMutation>(graphql`
      mutation EditBetaMoveDialog_updateBetaMoveMutation(
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

  const [highlightedMove] = useHighlight("move");
  // Find the highlighted move by ID
  const move = highlightedMove
    ? findNode(betaMoveConnection, highlightedMove.betaMoveId)
    : undefined;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Notes for Move {move?.order}</DialogTitle>

      <DialogContent>
        {move && (
          <EditBetaMoveDialogContent
            betaMoveKey={move}
            onEdit={(annotation) =>
              updateBetaMove({
                variables: {
                  input: {
                    betaMoveId: move.id,
                    annotation,
                  },
                },
                optimisticResponse: {
                  updateBetaMove: {
                    betaMove: {
                      id: move.id,
                      annotation,
                    },
                  },
                },
                onCompleted: onClose,
              })
            }
          />
        )}
      </DialogContent>

      <MutationErrorSnackbar message="Error editing move" state={updateState} />
    </Dialog>
  );
};

/**
 * Inner contents of the edit modal. Only rendered when a move is actively being
 * edited (i.e. not shown during the close animation, since a move is no longer
 * selected).
 */
const EditBetaMoveDialogContent: React.FC<{
  betaMoveKey: EditBetaMoveDialogContent_betaMoveNode$key;
  onEdit: (annotation: string) => void;
}> = ({ betaMoveKey, onEdit }) => {
  const betaMove = useFragment(
    graphql`
      fragment EditBetaMoveDialogContent_betaMoveNode on BetaMoveNode {
        id
        annotation
      }
    `,
    betaMoveKey
  );
  // Local state, will be propagated on field blur
  const [annotation, setAnnotation] = useState<string>(betaMove.annotation);
  const onSave = (): void => {
    // Trigger save action if the contents changed
    if (annotation !== betaMove.annotation) {
      onEdit(annotation);
    }
  };

  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSave();
      }}
    >
      <TextField
        autoFocus
        label="Notes"
        value={annotation}
        onChange={(e) => setAnnotation(e.target.value)}
        onBlur={onSave}
        sx={{
          width: "100%",
          marginTop: 1, // Prevents cutting off label on top
        }}
      />
    </form>
  );
};

export default EditBetaMoveDialog;
