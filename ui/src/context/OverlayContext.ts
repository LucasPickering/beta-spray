import React from "react";

export interface OverlayContextType {
  aspectRatio: number;
}

const OverlayContext = React.createContext<OverlayContextType>(
  {} as OverlayContextType
);

export default OverlayContext;
