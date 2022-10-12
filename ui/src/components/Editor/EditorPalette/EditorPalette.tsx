import { useContext } from "react";
import { Divider, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { allBodyParts, formatBodyPart } from "util/svg";
import HelpText from "./HelpText";
import DragSourceButton from "./DragSourceButton";
import {
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "util/context";
import { PreloadedQuery } from "react-relay";
import { queriesBetaQuery } from "../__generated__/queriesBetaQuery.graphql";
import PlayPauseControls from "./PlayPauseControls";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import { HoldIconWrapped } from "../EditorSvg/HoldEditor/HoldIcon";

interface Props {
  selectedBeta: string | undefined;
  betaQueryRef: PreloadedQuery<queriesBetaQuery> | null | undefined;
}

/**
 * A collection of items that can be dragged onto the editor to create new
 * holds/moves.
 *
 * Appears in the top-left corner.
 */
const EditorPalette: React.FC<Props> = ({ betaQueryRef, selectedBeta }) => {
  const [visibility, setVisibility] = useContext(EditorVisibilityContext);

  return (
    <Paper>
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
      >
        {/* Misc utils */}
        <Stack direction="column">
          <HelpText />

          <Tooltip
            title={visibility ? "Hide Overlay" : "Show Overlay"}
            placement="right"
          >
            <IconButton
              color={visibility ? "default" : "primary"}
              onClick={() => setVisibility((prev) => !prev)}
            >
              {visibility ? <IconVisibilityOff /> : <IconVisibility />}
            </IconButton>
          </Tooltip>

          <PlayPauseControls queryRef={betaQueryRef} />
        </Stack>

        {/* Draggable items */}
        <Stack direction="column">
          <DragSourceButton
            title="Hold"
            disabled={!visibility}
            dragSpec={{ type: "overlayHold", item: { action: "create" } }}
          >
            <HoldIconWrapped />
          </DragSourceButton>

          {/* One button per body part */}
          {allBodyParts.map((bodyPart) => (
            <DragSourceButton
              key={bodyPart}
              disabled={!visibility || !selectedBeta}
              title={formatBodyPart(bodyPart)}
              dragSpec={{
                type: "overlayBetaMove",
                item: {
                  action: "create",
                  bodyPart,
                  // Assertion is safe because the button is disabled when beta is not
                  // selected
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  betaId: selectedBeta!,
                },
              }}
            >
              <BetaMoveIconWrapped bodyPart={bodyPart} />
            </DragSourceButton>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default EditorPalette;
