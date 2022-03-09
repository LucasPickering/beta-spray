import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

/**
 * Wrapper for the sidebar next to the editor. Children should be provided by
 * the root editor, so that data/state/callbacks/etc. can more easily be passed
 */
const EditorSidebar: React.FC = ({ children }) => (
  <DndProvider backend={HTML5Backend} context={{}}>
    <div>{children}</div>
  </DndProvider>
);

export default EditorSidebar;
