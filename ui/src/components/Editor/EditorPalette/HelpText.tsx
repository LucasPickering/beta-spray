import { IconButton, Tooltip } from "@mui/material";
import { Help as IconHelp } from "@mui/icons-material";
import React from "react";

/**
 * An overlay to show contextual help on top of the editor.
 */
const HelpText: React.FC = () => (
  <Tooltip title={<HelpTextContent />} arrow describeChild>
    <IconButton>
      <IconHelp />
    </IconButton>
  </Tooltip>
);

const HelpTextContent: React.FC = () => {
  return (
    <>
      <div>
        <strong>Drag from the palette</strong> to create holds and moves
      </div>
      <div>
        <strong>Drag a move or hold</strong> to relocate
      </div>
      <div>
        <strong>Drag a line</strong> to add an intermediate move
      </div>
      <div>
        <strong>Drag a hold or move to the trash</strong> to delete
      </div>
      <div>
        <strong>Double click a move</strong> to edit
      </div>
      <div>
        <strong>Reorder moves</strong> in the list at right
      </div>
    </>
  );
};

export default HelpText;
