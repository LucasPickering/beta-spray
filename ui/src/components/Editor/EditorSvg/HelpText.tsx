import { IconButton, Tooltip } from "@mui/material";
import { Help as IconHelp } from "@mui/icons-material";
import React from "react";

interface Props {
  helpMode: "noBeta" | "editHolds" | "editBeta";
}

/**
 * An overlay to show contextual help on top of the editor.
 */
const HelpText: React.FC<Props> = ({ helpMode }) => (
  <Tooltip title={<HelpTextContent helpMode={helpMode} />} arrow describeChild>
    <IconButton>
      <IconHelp />
    </IconButton>
  </Tooltip>
);

const HelpTextContent: React.FC<Props> = ({ helpMode }) => {
  switch (helpMode) {
    case "noBeta":
      return (
        <>
          <div>
            <strong>Click &quot;Edit Holds&quot;</strong> to mark holds in the
            problem
          </div>
          <div>
            <strong>Add beta in the sidebar</strong> to start marking moves
          </div>
        </>
      );
    case "editHolds":
      return (
        <>
          <div>
            <strong>Double click anywhere</strong> to add a hold
          </div>
          <div>
            <strong>Drag a hold</strong> to relocate
          </div>
          <div>
            <strong>Double click a hold</strong> to delete
          </div>
        </>
      );
    case "editBeta":
      return (
        <>
          <div>
            <strong>Click a hold</strong> to add a move
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
};

export default HelpText;
