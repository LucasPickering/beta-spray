import { useContext } from "react";
import { Divider, IconButton, Paper, Stack } from "@mui/material";
import HelpText from "./HelpText";
import {
  ArrowBack as IconArrowBack,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import { PreloadedQuery } from "react-relay";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import PlayPauseControls from "./PlayPauseControls";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";
import AddHoldButton from "./AddHoldButton";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";

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
    <Paper>
      <Stack
        direction="column"
        divider={<Divider orientation="horizontal" flexItem />}
      >
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

        <Stack direction="row">
          <PlayPauseControls queryRef={betaQueryRef} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default EditorPalette;
