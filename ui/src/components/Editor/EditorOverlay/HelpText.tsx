import { IconButton, Tooltip } from "@mui/material";
import { Help as IconHelp } from "@mui/icons-material";
import React from "react";

interface Props {
  helpMode: "noBeta" | "editHolds" | "editBeta";
}

function getHelpText(helpMode: Props["helpMode"]): React.ReactChild {
  switch (helpMode) {
    case "noBeta":
      return (
        <>
          <div>Click &quot;Edit Holds&quot; to mark holds in the problem</div>
          <div>Add or select beta to start marking moves</div>
        </>
      );
    case "editHolds":
      return (
        <>
          <div>Click to add a hold</div>
          <div>Drag to move</div>
          <div>Double click to delete</div>
        </>
      );
    case "editBeta":
      return (
        <>
          <div>Click a hold to add an initial move</div>
          <div>Drag a leading move to add a new move</div>
          <div>Drag any other move to relocate</div>
          <div>Drag a line to add an intermediate move</div>
          <div>Double click a move to delete</div>
          <div>Reorder moves in the list at right</div>
        </>
      );
  }
}

/**
 * An overlay to show contextual help on top of the editor.
 */
const HelpText: React.FC<Props> = ({ helpMode }) => (
  // TODO handle touch correctly
  <Tooltip title={getHelpText(helpMode)} disableFocusListener>
    <IconButton
      size="small"
      sx={({ spacing }) => ({
        position: "absolute",
        top: spacing(1),
        left: spacing(1),
      })}
    >
      <IconHelp />
    </IconButton>
  </Tooltip>
);

export default HelpText;
