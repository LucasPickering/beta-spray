import { useContext } from "react";
import { Divider, IconButton, Paper, Stack } from "@mui/material";
import HelpText from "./HelpText";
import DragSourceButton from "./DragSourceButton";
import {
  ArrowBack as IconArrowBack,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "components/Editor/util/context";
import { PreloadedQuery } from "react-relay";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import PlayPauseControls from "./PlayPauseControls";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";
import TooltipIconButton from "components/common/TooltipIconButton";
import { Link } from "react-router-dom";

interface Props {
  betaQueryRef: PreloadedQuery<queriesBetaQuery> | null | undefined;
}

/**
 * A collection of items that can be dragged onto the editor to create new
 * holds/moves.
 *
 * Appears in the top-left corner.
 */
const EditorPalette: React.FC<Props> = ({ betaQueryRef }) => {
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

          <DragSourceButton
            title="Hold"
            disabled={!visibility}
            dragSpec={{ type: "overlayHold", item: { action: "create" } }}
          >
            <HoldIconWrapped />
          </DragSourceButton>
        </Stack>

        <Stack direction="row">
          <PlayPauseControls queryRef={betaQueryRef} />
        </Stack>
      </Stack>
    </Paper>
  );
};

export default EditorPalette;
