import React, { useContext } from "react";
import { BodyPart, formatBodyPart } from "util/svg";
import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";
import useMutation from "util/useMutation";
import { graphql, useFragment } from "react-relay";
import MutationError from "components/common/MutationError";
import { EditorContext } from "util/context";
import { BetaMoveDialog_appendBetaMoveMutation } from "./__generated__/BetaMoveDialog_appendBetaMoveMutation.graphql";
import { assertIsDefined } from "util/func";
import { BetaMoveDialog_betaNode$key } from "./__generated__/BetaMoveDialog_betaNode.graphql";

interface Props {
  betaKey: BetaMoveDialog_betaNode$key;
}

/**
 * A list of all body parts, in the order this component shows
 */
const bodyParts: BodyPart[] = [
  "LEFT_HAND",
  "RIGHT_HAND",
  "RIGHT_FOOT",
  "LEFT_FOOT",
];

/**
 * Render a dialog modal with one button per body part. Each button will add a
 * beta move when clicked. This is rendered after the user clicks a hold.
 */
const BetaMoveDialog: React.FC<Props> = ({ betaKey }) => {
  const beta = useFragment(
    graphql`
      fragment BetaMoveDialog_betaNode on BetaNode {
        id
      }
    `,
    betaKey
  );
  const { commit: appendBetaMove, state: appendState } =
    useMutation<BetaMoveDialog_appendBetaMoveMutation>(graphql`
      mutation BetaMoveDialog_appendBetaMoveMutation(
        $input: AppendBetaMoveMutationInput!
      ) {
        appendBetaMove(input: $input) {
          betaMove {
            beta {
              ...BetaEditor_betaNode # Refetch to update UI
            }
          }
        }
      }
    `);
  const { selectedHold, setSelectedHold } = useContext(EditorContext);

  const isOpen = Boolean(selectedHold);
  const onClose = (): void => setSelectedHold(undefined);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add a Move</DialogTitle>

      <DialogContent>
        {/* Show buttons in a 2x2 layout to mimic the body layout */}
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
          {bodyParts.map((bodyPart) => (
            <Button
              key={bodyPart}
              variant="outlined"
              onClick={() => {
                // The modal is closed when this is undefined, which means the
                // buttons aren't clickable
                assertIsDefined(selectedHold);

                appendBetaMove({
                  variables: {
                    input: {
                      betaId: beta.id,
                      bodyPart,
                      holdId: selectedHold,
                    },
                  },
                  // Punting on optimistic update because ordering is hard
                  onCompleted() {
                    onClose(); // Job's done, close the modal
                  },
                });
              }}
            >
              {formatBodyPart(bodyPart)}
            </Button>
          ))}
        </Box>
      </DialogContent>

      <MutationError message="Error adding move" state={appendState} />
    </Dialog>
  );
};

export default BetaMoveDialog;
