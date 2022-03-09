import React from "react";

export interface OverlayContextType {
  aspectRatio: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}

const OverlayContext = React.createContext<OverlayContextType>(
  {} as OverlayContextType
);

export default OverlayContext;
