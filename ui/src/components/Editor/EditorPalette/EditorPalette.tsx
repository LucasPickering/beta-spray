import { useContext } from "react";
import {
  alpha,
  Box,
  Divider,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import HelpText from "./HelpText";
import {
  ArrowBack as IconArrowBack,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";
import { PreloadedQuery } from "react-relay";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import HoldEditorModeButton from "./HoldEditorModeButton";
import BetaMoveEditorModeButton from "./BetaMoveEditorModeButton";

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

          <HelpText />

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

        <Typography
          component="div"
          variant="caption"
          margin={1}
          marginBottom={0}
          lineHeight={1}
        >
          Editor Mode
        </Typography>
        <HoldEditorModeButton queryRef={problemQueryRef} />
        <BetaMoveEditorModeButton queryRef={betaQueryRef} />
      </Paper>
    </Box>
  );
};

export default EditorPalette;
