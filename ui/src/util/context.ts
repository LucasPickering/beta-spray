import { queriesBetaQuery } from "components/Editor/__generated__/queriesBetaQuery.graphql";
import { queriesProblemQuery } from "components/Editor/__generated__/queriesProblemQuery.graphql";
import React from "react";
import { PreloadedQuery } from "react-relay";
import { ColorPair, Dimensions, OverlayPosition } from "./svg";

/**
 * The different interaction moves that the editor can be in. This defines
 * the actions available to the user.
 */
export type EditorMode = "holds" | "beta";

export interface SvgContextType {
  svgRef: React.RefObject<SVGSVGElement | null>;
  dimensions: Dimensions;
}

/**
 * Data related to the SVG element that underpins the editor. Provided by
 * EditorSvg.
 */
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

/**
 * Generate data and callbacks related to the state of the editor. Provided by
 * Editor.
 */
export const EditorContext = React.createContext<EditorContextType>(
  {} as EditorContextType
);

export interface BetaContextType {
  betaMoveColors: Map<string, ColorPair>;
  betaMoveVisualPositions: Map<string, OverlayPosition>;
}

/**
 * Data related to a particular beta. This is meant to augment the data we get
 * from the server for the beta's move list, with UI-specific data. These fields
 * are optional, meaning that some providers may not provider all of them, if
 * not necessary within that component tree (to prevent unnecessary labor).
 * Provided by BetaEditor and BetaDetails.
 */
export const BetaContext = React.createContext<BetaContextType>({
  betaMoveColors: new Map(),
  betaMoveVisualPositions: new Map(),
});
