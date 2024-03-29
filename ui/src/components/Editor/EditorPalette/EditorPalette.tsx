import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import { useContext } from "react";
import { alpha, Box, Divider, IconButton, Paper } from "@mui/material";
import {
  Help as IconHelp,
  ArrowBack as IconArrowBack,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";
import { PreloadedQuery } from "react-relay";
import { useTour } from "@reactour/tour";
import EditorModeSelect from "./EditorModeSelect";

interface Props {
  problemQueryRef: PreloadedQuery<queriesProblemQuery> | null | undefined;
  betaQueryRef: PreloadedQuery<queriesBetaQuery> | null | undefined;
}

/**
 * A collection of items that can be dragged onto the editor to create new
 * holds/moves.
 *
 * Appears in the top-left corner.
 */
const EditorPalette: React.FC<Props> = ({ problemQueryRef, betaQueryRef }) => {
  const [visibility, setVisibility] = useContext(EditorVisibilityContext);
  const { setIsOpen } = useTour();

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
        <Box>
          <IconButton component={Link} to="/">
            <IconArrowBack />
          </IconButton>

          <IconButton
            aria-label="open guided help"
            onClick={() => setIsOpen(true)}
          >
            <IconHelp />
          </IconButton>

          <TooltipIconButton
            title={visibility ? "Hide Overlay" : "Show Overlay"}
            placement="bottom"
            color={visibility ? "default" : "primary"}
            onClick={() => setVisibility((prev) => !prev)}
          >
            {visibility ? <IconVisibilityOff /> : <IconVisibility />}
          </TooltipIconButton>
        </Box>

        <Divider />

        <EditorModeSelect
          problemQueryRef={problemQueryRef}
          betaQueryRef={betaQueryRef}
        />
      </Paper>
    </Box>
  );
};

export default EditorPalette;
