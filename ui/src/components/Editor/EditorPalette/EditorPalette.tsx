import { useContext } from "react";
import { alpha, Box, IconButton, Paper } from "@mui/material";
import HelpText from "./HelpText";
import {
  ArrowBack as IconArrowBack,
  Upload as IconUpload,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import { PreloadedQuery, useRelayEnvironment } from "react-relay";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";
import AddHoldButton from "./AddHoldButton";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import HighlightActions from "../HighlightActions/HighlightActions";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";

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
  const environment = useRelayEnvironment();

  return (
    <Box sx={{ position: "absolute", top: 0, left: 0, margin: 1 }}>
      <Paper
        sx={({ palette }) => ({
          display: "flex",
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
          placement="right"
          color={visibility ? "default" : "primary"}
          onClick={() => setVisibility((prev) => !prev)}
        >
          {visibility ? <IconVisibilityOff /> : <IconVisibility />}
        </TooltipIconButton>

        <AddHoldButton queryRef={problemQueryRef} disabled={!visibility} />

        <HighlightActions
          problemQueryRef={problemQueryRef}
          betaQueryRef={betaQueryRef}
        />

        <IconButton
          onClick={() => {
            environment.publishQueue();
          }}
        >
          <IconUpload />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default EditorPalette;
