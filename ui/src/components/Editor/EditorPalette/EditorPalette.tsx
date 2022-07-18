import { Paper, SvgIcon } from "@mui/material";
import { IconBodyPart } from "components/common/icons";
import React from "react";
import { BodyPart } from "util/svg";
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
  <Paper sx={{ position: "absolute", top: 40, left: 0, margin: 1 }}>
    <EditorPaletteButton
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
  </Paper>
);

export default EditorPalette;
