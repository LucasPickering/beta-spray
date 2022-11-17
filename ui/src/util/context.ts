import React from "react";
import { noop } from "./func";
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

/**
 * ID of the selected beta. This is just the value (and doesn't include the setter)
 * because access to the setter is restricted as a tradeoff for convenience.
 */
export const EditorSelectedBetaContext = React.createContext<
  string | undefined
>(undefined);

/**
 * A UI item that can be highlighted on hover/tap. This will allow the user to
 * view details on the highlighted item, or execute certain actions. Each
 * variant just holds a kind + ID, but each variant stores the ID in a different
 * field so that usages have to be explicit about each variant(s) they can work
 * with.
 */
export type HighlightedItem =
  | { kind: "hold"; holdId: string }
  | { kind: "move"; betaMoveId: string };

export const EditorHighlightedItemContext = React.createContext<
  StateContext<HighlightedItem | undefined>
>([undefined, noop]);

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
