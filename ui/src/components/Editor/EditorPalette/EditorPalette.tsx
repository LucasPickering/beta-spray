import { useContext } from "react";
import { alpha, Box, IconButton, Paper } from "@mui/material";
import HelpText from "./HelpText";
import {
  ArrowBack as IconArrowBack,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
  ChangeCircle as IconChangeCircle,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";
import { useEditorMode } from "../util/mode";

/**
 * A collection of items that can be dragged onto the editor to create new
 * holds/moves.
 *
 * Appears in the top-left corner.
 */
const EditorPalette: React.FC = () => {
  const [visibility, setVisibility] = useContext(EditorVisibilityContext);
  const { toggleEditorMode } = useEditorMode();

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

        <IconButton onClick={() => toggleEditorMode()}>
          {/* TODO better icon */}
          <IconChangeCircle />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default EditorPalette;
