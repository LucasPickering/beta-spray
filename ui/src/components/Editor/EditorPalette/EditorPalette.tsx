import React, { useContext } from "react";
import { Divider, IconButton, Paper, Stack, Tooltip } from "@mui/material";
import { IconBodyPart } from "components/common/icons";
import { BodyPart, formatBodyPart } from "util/svg";
import HelpText from "./HelpText";
import DragSourceButton from "./DragSourceButton";
import {
  Circle as IconCircle,
  Visibility as IconVisibility,
  VisibilityOff as IconVisibilityOff,
} from "@mui/icons-material";
import { EditorVisibilityContext } from "util/context";

// Body parts, order top-left to bottom-right
const bodyParts: BodyPart[] = [
  "LEFT_HAND",
  "RIGHT_HAND",
  "LEFT_FOOT",
  "RIGHT_FOOT",
];

interface Props {
  selectedBeta: string | undefined;
}

/**
 * A collection of items that can be dragged onto the editor to create new
 * holds/moves.
 *
 * Appears in the top-left corner.
 */
const EditorPalette: React.FC<Props> = ({ selectedBeta }) => {
  const [visibility, setVisibility] = useContext(EditorVisibilityContext);

  return (
    <Paper>
      <Stack direction="column" divider={<Divider />}>
        {/* Misc utils */}
        <Stack direction="row">
          <HelpText />

          <Tooltip title={visibility ? "Hide Overlay" : "Show Overlay"}>
            <IconButton
              color={visibility ? "default" : "primary"}
              onClick={() => setVisibility((prev) => !prev)}
            >
              {visibility ? <IconVisibilityOff /> : <IconVisibility />}
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Draggable items */}
        <Stack direction="row">
          <DragSourceButton
            title="Hold"
            disabled={!visibility}
            dragSpec={{ type: "holdOverlay", item: { action: "create" } }}
          >
            <IconCircle />
          </DragSourceButton>

          {/* One button per body part */}
          {bodyParts.map((bodyPart) => (
            <DragSourceButton
              key={bodyPart}
              // TODO auto-create a beta server-side when adding a move, if necessary
              disabled={!visibility || !selectedBeta}
              title={formatBodyPart(bodyPart)}
              dragSpec={{
                type: "betaMoveOverlay",
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
              <IconBodyPart bodyPart={bodyPart} />
            </DragSourceButton>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default EditorPalette;
