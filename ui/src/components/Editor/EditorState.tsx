import { useState } from "react";
import {
  EditorVisibilityContext,
  EditorSelectedBetaContext,
  StanceBetaMoveContext,
} from "./util/context";
import {
  HighlightedItem,
  EditorHighlightedItemContext,
} from "./util/highlight";

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
  // Which move denotes the current stick figure stance? This will be the *first*
  // move in the stance
  // TODO this logic needs a refactor -- maybe we should store the whole stance?
  const stanceState = useState<string | undefined>();

  return (
    <EditorVisibilityContext.Provider value={visibilityState}>
      <EditorSelectedBetaContext.Provider value={selectedBeta}>
        <EditorHighlightedItemContext.Provider value={highlightedItemState}>
          <StanceBetaMoveContext.Provider value={stanceState}>
            {children}
          </StanceBetaMoveContext.Provider>
        </EditorHighlightedItemContext.Provider>
      </EditorSelectedBetaContext.Provider>
    </EditorVisibilityContext.Provider>
  );
};

export default EditorState;
