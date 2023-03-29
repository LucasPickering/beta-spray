import { useContext } from "react";
import {
  alpha,
  Box,
  Divider,
  IconButton,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import HelpText from "./HelpText";
import {
  Add as IconAdd,
  ArrowBack as IconArrowBack,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
  OpenWith as IconOpenWith,
  ChangeCircle as IconChangeCircle,
  Edit as IconEdit,
  Delete as IconDelete,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";
import { EditorMode, useEditorMode } from "../util/mode";

/**
 * A collection of items that can be dragged onto the editor to create new
 * holds/moves.
 *
 * Appears in the top-left corner.
 */
const EditorPalette: React.FC = () => {
  const [visibility, setVisibility] = useContext(EditorVisibilityContext);
  const { action, toggleItemType, setAction } = useEditorMode();

  // TODO integrate permissions to disable buttons

  return (
    <Box sx={{ position: "absolute", top: 0, left: 0, margin: 1 }}>
      <Paper
        sx={({ palette }) => ({
          backgroundColor: alpha(
            palette.background.paper,
            palette.opacity.translucent
          ),
        })}
      >
        <Stack direction="row">
          <IconButton component={Link} to="/">
            <IconArrowBack />
          </IconButton>

          <HelpText />

          <TooltipIconButton
            title={visibility ? "Hide Overlay" : "Show Overlay"}
            placement="bottom"
            color={visibility ? "default" : "primary"}
            onClick={() => setVisibility((prev) => !prev)}
          >
            {visibility ? <IconVisibilityOff /> : <IconVisibility />}
          </TooltipIconButton>

          <IconButton onClick={() => toggleItemType()}>
            {/* TODO better icon */}
            <IconChangeCircle />
          </IconButton>
        </Stack>

        <Divider />

        <ToggleButtonGroup
          aria-label="editor action"
          value={action}
          exclusive
          size="small"
          onChange={(e, newAction: EditorMode["action"]) =>
            setAction(newAction)
          }
        >
          {/* TODO accessible labels */}
          <ToggleButton value="add" color="editorAction--add">
            <IconAdd />
          </ToggleButton>
          <ToggleButton value="relocate" color="editorAction--relocate">
            <IconOpenWith />
          </ToggleButton>
          <ToggleButton value="edit" color="editorAction--edit">
            <IconEdit />
          </ToggleButton>
          <ToggleButton value="delete" color="editorAction--delete">
            <IconDelete />
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>
    </Box>
  );
};

export default EditorPalette;
