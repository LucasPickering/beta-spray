import { useState } from "react";
import {
  EditorMode,
  EditorModeContext,
  EditorVisibilityContext,
} from "./util/context";
import { StanceContextProvider } from "./util/stance";

interface Props {
  children?: React.ReactNode;
}

/**
 * A component to manage global state for the editor. All state fields will be
 * stored here, and provided to the entire Editor tree via context.
 */
const EditorState: React.FC<Props> = ({ children }) => {
  // These *don't* unpack the array, so they can be passed to context without
  // unnecessarily creating a new array object (and thus re-render)

  // Flag to show/hide the overlay, toggled by a user button
  const visibilityState = useState<boolean>(true);
  // Toggle between editing holds and beta
  const editorModeState = useState<EditorMode>("view");
  // Which move denotes the current stick figure stance? This will be the *last*
  // move in the stance
  const stanceState = useState<string | undefined>();

  return (
    <EditorVisibilityContext.Provider value={visibilityState}>
      <EditorModeContext.Provider value={editorModeState}>
        <StanceContextProvider value={stanceState}>
          {children}
        </StanceContextProvider>
      </EditorModeContext.Provider>
    </EditorVisibilityContext.Provider>
  );
};

export default EditorState;
