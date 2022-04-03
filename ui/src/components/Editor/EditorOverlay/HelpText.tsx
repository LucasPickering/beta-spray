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
          <div>
            <strong>Click a hold</strong> to add initial move
          </div>
          <div>
            <strong>Drag a leading move</strong> to add new move
          </div>
          <div>
            <strong>Drag any other move</strong> to relocate
          </div>
          <div>
            <strong>Drag a line</strong> to add an intermediate move
          </div>
          <div>
            <strong>Double click a move</strong> to delete
          </div>
          <div>
            <strong>Reorder moves</strong> in the list at right
          </div>
        </>
      );
  }
}

/**
 * An overlay to show contextual help on top of the editor.
 */
const HelpText: React.FC<Props> = ({ helpMode }) => (
  <Tooltip title={getHelpText(helpMode)}>
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
