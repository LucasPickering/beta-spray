import React from "react";
import OverlayContext from "context/OverlayContext";
import { DndProvider } from "react-dnd";
import MouseBackEnd from "react-dnd-mouse-backend";

interface Props {
  aspectRatio: number;
}

/**
 * Visualization of holds & beta onto the boulder image
 */
const EditorOverlay: React.FC<Props> = ({ aspectRatio, children }) => (
  // HTML5 backend doesn't work in SVG, so we need to override it here
  <DndProvider backend={MouseBackEnd} context={window}>
    <OverlayContext.Provider value={{ aspectRatio }}>
      <svg
        // TODO figure out a better way to handle coords so we don't need to
        // pass aspectRatio around
        viewBox={`0 0 100 ${100 / aspectRatio}`}
        width="100%"
        height="100%"
        style={{
          // Overlay on top of the background image
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </svg>
    </OverlayContext.Provider>
  </DndProvider>
);

export default EditorOverlay;
