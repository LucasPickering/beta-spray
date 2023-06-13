import { assertIsDefined, isDefined } from "util/func";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "./Editor";
import {
  EditorMode,
  EditorSelectedBetaContext,
  EditorVisibilityContext,
  EditorModeContext,
} from "./util/context";
import { StanceContextProvider } from "./util/stance";

/**
 * Main app component, for viewing+editing boulders/problems/betas. This is
 * mainly just a shell for managing state that crosses between the editor
 * overlay (the controls that appear over the image, which is SVG) and the
 * sidebar (everything else, standard HTML).
 */
const EditorPage: React.FC = () => {
  const { problemId, betaId } = useParams();
  assertIsDefined(problemId); // Only undefined if routing isn't hooked up right

  // These *don't* unpack the array, so they can be passed to context without
  // unnecessarily creating a new array object (and thus re-render)

  // Which beta is selected in the list?
  const selectedBetaState = useState<string | undefined>(betaId);
  const [selectedBeta, setSelectedBeta] = selectedBetaState;
  // Flag to show/hide the overlay, toggled by a user button
  const visibilityState = useState<boolean>(true);
  // Toggle between editing holds and beta
  const editorModeState = useState<EditorMode>("beta");
  // Which move denotes the current stick figure stance? This will be the *last*
  // move in the stance
  const stanceState = useState<number>(-1);

  // Make sure state stays in sync with the URL
  // In most cases we should update both of these simultaneously so this hook
  // generally doesn't do anything, but it's a backup (e.g. if user externally
  // navigates to a different beta via bookmark, back button, etc.)
  useEffect(() => {
    setSelectedBeta(betaId);
  }, [betaId, setSelectedBeta]);

  // Force us into holds mode if no beta is selected
  const [, setEditorMode] = editorModeState;
  useEffect(() => {
    if (!isDefined(selectedBeta)) {
      setEditorMode("holds");
    }
  }, [setEditorMode, selectedBeta]);

  return (
    <EditorSelectedBetaContext.Provider value={selectedBetaState}>
      <EditorVisibilityContext.Provider value={visibilityState}>
        <EditorModeContext.Provider value={editorModeState}>
          <StanceContextProvider value={stanceState}>
            <Editor problemId={problemId} />
          </StanceContextProvider>
        </EditorModeContext.Provider>
      </EditorVisibilityContext.Provider>
    </EditorSelectedBetaContext.Provider>
  );
};

export default EditorPage;
