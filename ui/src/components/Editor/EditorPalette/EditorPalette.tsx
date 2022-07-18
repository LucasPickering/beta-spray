import { Paper, SvgIcon } from "@mui/material";
import React from "react";
import HoldIcon from "../EditorSvg/HoldEditor/HoldIcon";
import EditorPaletteButton from "./EditorPaletteButton";

const EditorPalette: React.FC = () => (
  <Paper sx={{ position: "absolute", top: 40, left: 0, margin: 1 }}>
    <EditorPaletteButton dragSpec={{ type: "holdOverlay", item: {} }}>
      <SvgIcon viewBox="-7 -7 14 14">
        <HoldIcon />
      </SvgIcon>
    </EditorPaletteButton>
  </Paper>
);

export default EditorPalette;
