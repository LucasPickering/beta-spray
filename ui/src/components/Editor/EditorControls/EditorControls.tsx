import React from "react";
import EditorPanel from "./EditorPanel";
import EditorDrawer from "./EditorDrawer";
import useIsWide from "util/useIsWide";

interface Props {
  children?: React.ReactNode;
}

/**
 * Wrapper for the controls next to the editor. Dynamically switches between a
 * static panel and a drawer based on screen size. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed
 */
const EditorControls: React.FC<Props> = ({ children }) =>
  useIsWide() ? (
    <EditorPanel>{children}</EditorPanel>
  ) : (
    <EditorDrawer>{children}</EditorDrawer>
  );

export default EditorControls;
