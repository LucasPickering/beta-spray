import { useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import EditorPanel from "./EditorPanel";
import EditorDrawer from "./EditorDrawer";

interface Props {
  children?: React.ReactNode;
}

/**
 * Wrapper for the controls next to the editor. Dynamically switches between a
 * static panel and a drawer based on screen size. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed
 */
const EditorControls: React.FC<Props> = ({ children }) => {
  const { breakpoints } = useTheme();

  return useMediaQuery(breakpoints.up("md")) ? (
    <EditorPanel>{children}</EditorPanel>
  ) : (
    <EditorDrawer>{children}</EditorDrawer>
  );
};

export default EditorControls;
