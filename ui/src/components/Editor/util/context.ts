import React from "react";
import { noop } from "util/func";
import { Dimensions, OverlayPosition } from "./svg";

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

/**
 * A React context definition based on a state field. The context contains the
 * state value and the setter, exactly as returned from useState. This format
 * means we can directly pass the returned value from useState to the context,
 * and not worry about unnecessary re-renders.
 */
export type StateContext<T> = [T, React.Dispatch<React.SetStateAction<T>>];

export const EditorVisibilityContext = React.createContext<
  StateContext<boolean>
>([true, noop]);

export type EditorMode = "editHolds" | "editBeta" | "view";

export const EditorModeContext = React.createContext<StateContext<EditorMode>>([
  "view",
  noop,
]);

export interface BetaContextType {
  betaMoveColors: Map<string, string>;
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
