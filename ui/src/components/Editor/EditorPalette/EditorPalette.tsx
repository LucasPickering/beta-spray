import { Divider, Paper, Stack } from "@mui/material";
import { IconBodyPart } from "components/common/icons";
import React from "react";
import { BodyPart, formatBodyPart } from "util/svg";
import HelpText from "./HelpText";
import DragSourceButton from "./DragSourceButton";
import { Circle as IconCircle } from "@mui/icons-material";

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
 */
const EditorPalette: React.FC<Props> = ({ selectedBeta }) => (
  <Paper>
    <Stack direction="row">
      <HelpText />

      <Divider orientation="vertical" flexItem />

      <DragSourceButton
        title="Hold"
        dragSpec={{ type: "holdOverlay", item: { action: "create" } }}
      >
        <IconCircle />
      </DragSourceButton>

      {/* One button per body part */}
      {bodyParts.map((bodyPart) => (
        <DragSourceButton
          key={bodyPart}
          // TODO auto-create a beta server-side when adding a move, if necessary
          disabled={!selectedBeta}
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
  </Paper>
);

export default EditorPalette;
