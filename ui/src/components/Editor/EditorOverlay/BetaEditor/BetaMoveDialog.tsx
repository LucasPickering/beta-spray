import React from "react";
import { BodyPart, formatBodyPart } from "../types";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectBodyPart: (bodyPart: BodyPart) => void;
}

/**
 * A dumb component to render a modal with one button per body part
 */
const BetaMoveDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelectBodyPart,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Add a Move</DialogTitle>

      <DialogContent>
        <Stack direction="column">
          {Object.values(BodyPart).map((bodyPart) => (
            <Button
              key={bodyPart}
              // TODO support body part as color prop
              onClick={() => onSelectBodyPart(bodyPart)}
              sx={({ palette }) => ({
                backgroundColor: palette.bodyParts[bodyPart],
              })}
            >
              {formatBodyPart(bodyPart)}
            </Button>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default BetaMoveDialog;
