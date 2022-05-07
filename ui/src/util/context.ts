import React from "react";
import { Dimensions, ZoomOffset } from "components/Editor/EditorSvg/types";

export interface SvgContextType {
  svgRef: React.RefObject<SVGSVGElement | null>;
  dimensions: Dimensions;
}

export const SvgContext = React.createContext<SvgContextType>(
  {} as SvgContextType
);

export interface EditorContextType {
  editingHolds: boolean;
  setEditingHolds: React.Dispatch<React.SetStateAction<boolean>>;
  selectedHold: string | undefined;
  setSelectedHold: React.Dispatch<React.SetStateAction<string | undefined>>;
  highlightedMove: string | undefined;
  setHighlightedMove: React.Dispatch<React.SetStateAction<string | undefined>>;
  zoomOffset: ZoomOffset;
  setZoomOffset: React.Dispatch<React.SetStateAction<ZoomOffset>>;
}

export const EditorContext = React.createContext<EditorContextType>(
  {} as EditorContextType
);
