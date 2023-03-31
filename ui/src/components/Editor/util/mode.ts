/**
 * TODO module comment
 */

import React, { useContext } from "react";
import { StateContext } from "./context";
import { noop } from "util/func";

// TODO better name for this
export type EditorMode = "hold" | "betaMove";

export const EditorModeContext = React.createContext<StateContext<EditorMode>>([
  "betaMove",
  noop,
]);

export function useEditorMode(): {
  editorMode: EditorMode;
  toggleEditorMode: () => void;
} {
  const [editorMode, setEditorMode] = useContext(EditorModeContext);
  const toggleEditorMode = (): void => {
    setEditorMode((editorMode) =>
      editorMode === "hold" ? "betaMove" : "hold"
    );
  };
  return { editorMode, toggleEditorMode };
}
