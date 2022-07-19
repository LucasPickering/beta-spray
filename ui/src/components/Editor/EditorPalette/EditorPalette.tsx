import { Paper, Stack, SvgIcon } from "@mui/material";
import { IconBodyPart } from "components/common/icons";
import React from "react";
import { BodyPart, formatBodyPart } from "util/svg";
import HelpText from "../EditorSvg/HelpText";
import HoldIcon from "../EditorSvg/HoldEditor/HoldIcon";
import EditorPaletteButton from "./EditorPaletteButton";

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
 * TODO
 */
const EditorPalette: React.FC<Props> = ({ selectedBeta }) => (
  <Paper>
    <Stack direction="row">
      <HelpText />

      <EditorPaletteButton
        title="Hold"
        dragSpec={{ type: "holdOverlay", item: { action: "create" } }}
      >
        {/* TODO clean up this icon */}
        <SvgIcon viewBox="-7 -7 14 14">
          <HoldIcon />
        </SvgIcon>
      </EditorPaletteButton>

      {/* One button per body part */}
      {bodyParts.map((bodyPart) => (
        <EditorPaletteButton
          key={bodyPart}
          // TODO add a tooltip that explains why this is disabled
          // OR even better, just auto-create a beta server-side
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
        </EditorPaletteButton>
      ))}
    </Stack>
  </Paper>
);

export default EditorPalette;
