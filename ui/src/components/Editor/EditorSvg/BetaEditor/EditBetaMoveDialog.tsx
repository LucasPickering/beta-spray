import React, { FormEvent, useContext, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from "@mui/material";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationErrorSnackbar from "components/common/MutationErrorSnackbar";
import { Delete as IconDelete } from "@mui/icons-material";
import { EditorSelectedMoveContext } from "util/context";
import { EditBetaMoveDialog_betaNode$key } from "./__generated__/EditBetaMoveDialog_betaNode.graphql";
import { EditBetaMoveDialogContent_deleteBetaMoveMutation } from "./__generated__/EditBetaMoveDialogContent_deleteBetaMoveMutation.graphql";
import { EditBetaMoveDialogContent_updateBetaMoveMutation } from "./__generated__/EditBetaMoveDialogContent_updateBetaMoveMutation.graphql";
import { EditBetaMoveDialogContent_betaMoveNode$key } from "./__generated__/EditBetaMoveDialogContent_betaMoveNode.graphql";
import { deleteBetaMoveLocal } from "util/moves";

interface Props {
  betaKey: EditBetaMoveDialog_betaNode$key;
}

/**
 * Outer edit modal. Rendered at all times, but only open when a move is
 * selected (to allow for open/closing animations).
 */
const EditBetaMoveDialog: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment EditBetaMoveDialog_betaNode on BetaNode {
        id
        moves {
          edges {
            node {
              id
              order
              isStart
              ...EditBetaMoveDialogContent_betaMoveNode
            }
          }
        }
      }
    `,
    betaKey
  );
  const { commit: updateBetaMove, state: updateState } =
    useMutation<EditBetaMoveDialogContent_updateBetaMoveMutation>(graphql`
      mutation EditBetaMoveDialogContent_updateBetaMoveMutation(
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
    useMutation<EditBetaMoveDialogContent_deleteBetaMoveMutation>(graphql`
      mutation EditBetaMoveDialogContent_deleteBetaMoveMutation(
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

  const [selectedMoveId, setSelectedMoveId] = useContext(
    EditorSelectedMoveContext
  );
  // Find the selected move by ID
  const selectedMove = selectedMoveId
    ? beta.moves.edges.find(({ node }) => node.id === selectedMoveId)?.node
    : undefined;
  const onClose = (): void => setSelectedMoveId(undefined);

  return (
    <Dialog open={Boolean(selectedMove)} onClose={onClose}>
      <DialogTitle>Edit Move</DialogTitle>

      <DialogContent>
        {selectedMove && (
          <EditBetaMoveDialogContent
            betaMoveKey={selectedMove}
            onEdit={(annotation) =>
              updateBetaMove({
                variables: {
                  input: {
                    betaMoveId: selectedMove.id,
                    annotation,
                  },
                },
                optimisticResponse: {
                  updateBetaMove: {
                    betaMove: {
                      id: selectedMove.id,
                      annotation,
                    },
                  },
                },
                onCompleted: onClose,
              })
            }
            onDelete={() =>
              deleteBetaMove({
                variables: { input: { betaMoveId: selectedMove.id } },
                // Reset selection to prevent ghost highlight
                onCompleted: onClose,
                optimisticResponse: {
                  deleteBetaMove: {
                    betaMove: {
                      id: selectedMove.id,
                      beta: {
                        id: beta.id,
                        moves: deleteBetaMoveLocal(beta.moves, selectedMove.id),
                      },
                    },
                  },
                },
              })
            }
          />
        )}
      </DialogContent>

      <MutationErrorSnackbar message="Error editing move" state={updateState} />
      <MutationErrorSnackbar
        message="Error deleting move"
        state={deleteState}
      />
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
  onDelete: () => void;
}> = ({ betaMoveKey, onEdit, onDelete }) => {
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
    <Grid container spacing={1}>
      <Grid
        item
        xs={12}
        component="form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          onSave();
        }}
      >
        <TextField
          label="Notes"
          value={annotation}
          onChange={(e) => setAnnotation(e.target.value)}
          onBlur={onSave}
          sx={{
            width: "100%",
            marginTop: 1, // Prevents cutting off label on top
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          color="primary"
          variant="contained"
          startIcon={<IconDelete />}
          onClick={onDelete}
          sx={{ width: "100%" }}
        >
          Delete
        </Button>
      </Grid>
    </Grid>
  );
};

export default EditBetaMoveDialog;
