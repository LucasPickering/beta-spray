/**
 * TODO module comment
 */

import React, { useContext } from "react";
import { StateContext } from "./context";
import { noop } from "util/func";

// TODO better name for this
export type EditorMode = {
  itemType: "hold" | "betaMove"; // TODO rename
  action: "add" | "relocate" | "edit" | "delete";
};

export const EditorModeContext = React.createContext<StateContext<EditorMode>>([
  { itemType: "hold", action: "add" },
  noop,
]);

export function useEditorMode(): {
  itemType: EditorMode["itemType"];
  action: EditorMode["action"];
  toggleItemType: () => void;
  setAction: (action: EditorMode["action"]) => void;
} {
  const [{ itemType, action }, setEditorMode] = useContext(EditorModeContext);
  const toggleItemType = (): void => {
    setEditorMode(({ itemType, action }) => ({
      itemType: itemType === "hold" ? "betaMove" : "hold",
      action,
    }));
  };
  const setAction = (action: EditorMode["action"]): void => {
    setEditorMode(({ itemType }) => ({ itemType, action }));
  };
  return { itemType, action, toggleItemType, setAction };
}
