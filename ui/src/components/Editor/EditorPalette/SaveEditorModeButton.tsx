import { Done as IconDone } from "@mui/icons-material";
import TooltipIconButton from "components/common/TooltipIconButton";
import { useContext } from "react";
import { EditorModeContext } from "../util/context";

/**
 * Button to revert the editor mode to view.
 */
const SaveEditorModeButton: React.FC = () => {
  const [, setEditorMode] = useContext(EditorModeContext);

  return (
    <TooltipIconButton
      title="Save"
      color="success"
      onClick={() => setEditorMode("view")}
    >
      <IconDone />
    </TooltipIconButton>
  );
};

export default SaveEditorModeButton;
