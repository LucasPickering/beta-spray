import React from "react";

export interface OverlayContextType {
  aspectRatio: number;
  d3Svg: d3.Selection<SVGGElement, unknown, null, undefined>;
}

const OverlayContext = React.createContext<OverlayContextType>(
  {} as OverlayContextType
);

export default OverlayContext;
