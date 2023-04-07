import { useContext } from "react";
import { EditorMode, EditorModeContext } from "../util/context";
import { Typography } from "@mui/material";

/**
 * Just a helpful little label to tell the user which mode they're in.
 *
 * This looks a bit janky but hopefully it's useful at least.
 */
const EditorModeLabel: React.FC = () => {
  const [editorMode] = useContext(EditorModeContext);

  return (
    <Typography
      component="div"
      variant="caption"
      margin={1}
      marginBottom={0}
      lineHeight={1}
    >
      Mode: {getLabel(editorMode)}
    </Typography>
  );
};

function getLabel(editorMode: EditorMode): string {
  switch (editorMode) {
    case "view":
      return "View Only";
    case "editHolds":
      return "Edit Holds";
    case "editBetaMoves":
      return "Edit Beta";
  }
}

export default EditorModeLabel;
