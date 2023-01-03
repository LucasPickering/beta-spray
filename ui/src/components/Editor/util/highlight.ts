/**
 * Utilities for managing highlighted items. A "highlighted" item is one that
 * is primarily selected in the editor UI. Only one item can be highlighted at
 * a time. Multiple types of items can be highlighted (move, hold, etc.), so
 * this code is all generic across types. In most cases we only care about a
 * single type of highlightable item, in which case you can use `useHighlight`.
 */

import React, { useContext, useCallback } from "react";
import { StateContext } from "./context";
import { noop } from "../../../util/func";

/**
 * A UI item that can be highlighted on hover/tap. This will allow the user to
 * view details on the highlighted item, or execute certain actions.
 */
export type HighlightedItem = { kind: "hold" | "move"; id: string };

type Kind = HighlightedItem["kind"];

/**
 * Context for accessing and setting the currently-highlighted item. You
 * probably shouldn't access this directly. Instead, use `useHighlight`.
 */
export const EditorHighlightedItemContext = React.createContext<
  StateContext<HighlightedItem | undefined>
>([undefined, noop]);

/**
 * A hook that restricts highlighted item usage to a singular kind. This is for
 * convenience when operating around only a single kind of highlighted item. If
 * any other kind is highlighted, this will behave as if nothing is highlighted.
 *
 * @param kind The particular kind of highlighted item that this use case wants
 */
export function useHighlight<K extends Kind>(
  kind: K
): [
  string | undefined,
  React.Dispatch<React.SetStateAction<string | undefined>>
] {
  const [highlightedItem, setHighlightedItem] = useContext(
    EditorHighlightedItemContext
  );

  // Memoize the setter
  const highlightItem = useCallback(
    // The setter doesn't require the `kind` field to be in passed values,
    // since we know that value will always be the same. We'll inject it
    // ourselves
    (highlightedItemId: React.SetStateAction<string | undefined>) => {
      // Handle if the state value is a callback, which should be passed the
      // previous state value.
      if (typeof highlightedItemId === "function") {
        setHighlightedItem((prev) => {
          // Use the passed mapper function to get a new state value. If the
          // previous state item is not of `kind`, then restrictKind will
          // pretend there is no previous value.
          const id = highlightedItemId(restrictKind(kind, prev));
          return id ? { kind, id } : undefined;
        });
      } else {
        // Plain item is passed - inject the kind here
        setHighlightedItem(
          highlightedItemId ? { kind, id: highlightedItemId } : undefined
        );
      }
    },
    [kind, setHighlightedItem]
  );

  return [restrictKind(kind, highlightedItem), highlightItem];
}

/**
 * Restrict the highlighted item to the given type. If the item isn't of that
 * type, return undefined instead of the highlighted ID.
 */
function restrictKind<K extends Kind>(
  kind: K,
  highlightedItem: HighlightedItem | undefined
): string | undefined {
  return highlightedItem?.kind === kind ? highlightedItem.id : undefined;
}
