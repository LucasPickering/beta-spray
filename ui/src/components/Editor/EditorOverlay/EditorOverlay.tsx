import React, { useRef } from "react";
import OverlayContext from "context/OverlayContext";

interface Props {
  aspectRatio: number;
}

/**
 * Visualization of holds & beta onto the boulder image. This is just a wrapper,
 * children are passed in by the parent so that props can be drilled more
 * easily.
 */
const EditorOverlay: React.FC<Props> = ({ aspectRatio, children }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  // Make sure 100 is always the *smaller* of the two dimensions, so we get
  // consistent sizing on SVG elements
  const [viewBoxWidth, viewBoxHeight] =
    aspectRatio < 1 ? [100, 100 / aspectRatio] : [100 * aspectRatio, 100];
  return (
    <OverlayContext.Provider
      value={{ viewBoxWidth, viewBoxHeight, svgRef: ref }}
    >
      <svg
        ref={ref}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
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
  );
};

export default EditorOverlay;
