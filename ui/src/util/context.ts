import React from "react";
import { Dimensions } from "./svg";

export interface SvgContextType {
  svgRef: React.RefObject<SVGSVGElement | null>;
  dimensions: Dimensions;
}

export const SvgContext = React.createContext<SvgContextType>(
  {} as SvgContextType
);

export interface EditorContextType {
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string | undefined) => void;
  editingHolds: boolean;
  setEditingHolds: React.Dispatch<React.SetStateAction<boolean>>;
  selectedHold: string | undefined;
  setSelectedHold: React.Dispatch<React.SetStateAction<string | undefined>>;
  highlightedMove: string | undefined;
  setHighlightedMove: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const EditorContext = React.createContext<EditorContextType>(
  {} as EditorContextType
);
