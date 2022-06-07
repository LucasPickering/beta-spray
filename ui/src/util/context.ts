import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { queriesProblemQuery } from "components/Editor/__generated__/queriesProblemQuery.graphql";
import React from "react";
import { PreloadedQuery } from "react-relay";
import { ColorPair, Dimensions, OverlayPosition } from "./svg";

// TODO comment all these

export type EditorMode = "holds" | "beta";

export interface SvgContextType {
  svgRef: React.RefObject<SVGSVGElement | null>;
  dimensions: Dimensions;
}

export const SvgContext = React.createContext<SvgContextType>(
  {} as SvgContextType
);

export interface EditorContextType {
  problemQueryRef: PreloadedQuery<queriesProblemQuery> | null | undefined;
  betaQueryRef: PreloadedQuery<queriesBetaQuery> | null | undefined;
  selectedBeta: string | undefined;
  setSelectedBeta: (betaId: string | undefined) => void;
  mode: EditorMode;
  setMode: React.Dispatch<React.SetStateAction<EditorMode>>;
  selectedHold: string | undefined;
  setSelectedHold: React.Dispatch<React.SetStateAction<string | undefined>>;
  highlightedMove: string | undefined;
  setHighlightedMove: React.Dispatch<React.SetStateAction<string | undefined>>;
}

export const EditorContext = React.createContext<EditorContextType>(
  {} as EditorContextType
);

export interface BetaContextType {
  betaMoveColors: Map<string, ColorPair>;
  betaMoveVisualPositions: Map<string, OverlayPosition>;
}

export const BetaContext = React.createContext<BetaContextType>({
  betaMoveColors: new Map(),
  betaMoveVisualPositions: new Map(),
});
