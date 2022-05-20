import React from "react";
import { BodyPart, formatBodyPart } from "util/svg";
import { Box, Button, Dialog, DialogContent, DialogTitle } from "@mui/material";

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
        {/* Show buttons in a 2x2 layout to mimic the body layout */}
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={1}>
          {Object.values(BodyPart).map((bodyPart) => (
            <Button
              key={bodyPart}
              variant="outlined"
              onClick={() => onSelectBodyPart(bodyPart)}
            >
              {formatBodyPart(bodyPart)}
            </Button>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default BetaMoveDialog;
