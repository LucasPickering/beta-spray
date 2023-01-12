import { useState } from "react";
import {
  EditorVisibilityContext,
  EditorSelectedBetaContext,
} from "./util/context";
import {
  HighlightedItem,
  EditorHighlightedItemContext,
} from "./util/highlight";
import { StanceContextProvider } from "./util/stance";

interface Props {
  selectedBeta: string | undefined;
  children?: React.ReactNode;
}

/**
 * A component to manage global state for the editor. All state fields will be
 * stored here, and provided to the entire Editor tree via context.
 */
const EditorState: React.FC<Props> = ({ selectedBeta, children }) => {
  // These *don't* unpack the array, so they can be passed to context without
  // unnecessarily creating a new array object (and thus re-render)

  // Flag to show/hide the overlay, toggled by a user button
  const visibilityState = useState<boolean>(true);
  // Which hold/move is being emphasized
  const highlightedItemState = useState<HighlightedItem | undefined>();
  // Which move denotes the current stick figure stance? This will be the *last*
  // move in the stance
  const stanceState = useState<string | undefined>();

  return (
    <EditorVisibilityContext.Provider value={visibilityState}>
      <EditorSelectedBetaContext.Provider value={selectedBeta}>
        <EditorHighlightedItemContext.Provider value={highlightedItemState}>
          <StanceContextProvider value={stanceState}>
            {children}
          </StanceContextProvider>
        </EditorHighlightedItemContext.Provider>
      </EditorSelectedBetaContext.Provider>
    </EditorVisibilityContext.Provider>
  );
};

export default EditorState;
