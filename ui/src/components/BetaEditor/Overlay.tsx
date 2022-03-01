import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import OverlayContext, { OverlayContextType } from "context/OverlayContext";

interface Props {
  aspectRatio: number;
}

/**
 * Visualization of holds onto the boulder image
 */
const Overlay: React.FC<Props> = ({ aspectRatio, children }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [d3Svg, setD3Svg] = useState<OverlayContextType["d3Svg"] | undefined>();

  // D3 stuff
  useEffect(() => {
    const svgEl = d3.select(svgRef.current);
    setD3Svg(svgEl.append("g"));
  }, [aspectRatio]);

  return (
    <svg
      ref={svgRef}
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
      {/* Don't render children until d3 is set up */}
      {d3Svg && (
        <OverlayContext.Provider value={{ aspectRatio, d3Svg }}>
          {children}
        </OverlayContext.Provider>
      )}
    </svg>
  );
};

export default Overlay;
