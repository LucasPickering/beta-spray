import { useContext } from "react";
import { Box, IconButton, Paper, Stack } from "@mui/material";
import HelpText from "./HelpText";
import {
  ArrowBack as IconArrowBack,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import { PreloadedQuery } from "react-relay";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";
import AddHoldButton from "./AddHoldButton";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";

interface Props {
  problemQueryRef: PreloadedQuery<queriesProblemQuery> | null | undefined;
}

/**
 * A collection of items that can be dragged onto the editor to create new
 * holds/moves.
 *
 * Appears in the top-left corner.
 */
const EditorPalette: React.FC<Props> = ({ problemQueryRef }) => {
  const [visibility, setVisibility] = useContext(EditorVisibilityContext);

  return (
    <Box sx={{ position: "absolute", top: 0, left: 0, margin: 1 }}>
      <Paper>
        <Stack direction="row">
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
        </Stack>
      </Paper>
    </Box>
  );
};

export default EditorPalette;
