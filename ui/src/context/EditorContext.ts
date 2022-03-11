import React from "react";

export interface EditorContextType {
  selectedHold: string | undefined;
  setSelectedHold: React.Dispatch<React.SetStateAction<string | undefined>>;
  highlightedMove: string | undefined;
  setHighlightedMove: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const EditorContext = React.createContext<EditorContextType>(
  {} as EditorContextType
);

export default EditorContext;
