import { useCallback, useContext } from "react";
import { EditorHighlightedItemContext, HighlightedItem } from "./context";

type Kind = HighlightedItem["kind"];

type SingleKindHighlightedItem<K extends Kind> = Extract<
  HighlightedItem,
  { kind: K }
>;

type OmitKind<K extends Kind> = Omit<SingleKindHighlightedItem<K>, "kind">;

type ReturnType<K extends Kind> = [
  SingleKindHighlightedItem<K> | undefined,
  React.Dispatch<React.SetStateAction<OmitKind<K> | undefined>>
];

/**
 * A hook that restricts highlighted item usage to a singular kind. This is for
 * convenience when operating around only a single kind of highlighted item. If
 * any other kind is highlighted, this will behave as if nothing is highlighted.
 *
 * @param kind The particular kind of highlighted item that this use case wants
 */
function useHighlight<K extends Kind>(kind: K): ReturnType<K> {
  const [highlightedItem, setHighlightedItem] = useContext(
    EditorHighlightedItemContext
  );

  // Memoize the setter
  const ass = useCallback(
    // The setter doesn't require the `kind` field to be in passed values,
    // since we know that value will always be the same. We'll inject it
    // ourselves
    (item: React.SetStateAction<OmitKind<K> | undefined>) => {
      // Handle if the state value is a callback, which should be passed the
      // previous state value.
      if (typeof item === "function") {
        setHighlightedItem((prev) => {
          // Use the passed mapper function to get a new state value. If the
          // previous state item is not of `kind`, then restrictKind will
          // pretend there is no previous value.
          const newItem = item(restrictKind(kind, prev));
          return injectKind(kind, newItem);
        });
      } else {
        // Plain item is passed - inject the kind here
        setHighlightedItem(injectKind(kind, item));
      }
    },
    [kind, setHighlightedItem]
  );

  return [restrictKind(kind, highlightedItem), ass];
}

function restrictKind<K extends Kind>(
  kind: K,
  highlightedItem: HighlightedItem | undefined
): SingleKindHighlightedItem<K> | undefined {
  return highlightedItem?.kind === kind
    ? // This type assertion *shouldn't* be necessary, but alas
      (highlightedItem as SingleKindHighlightedItem<K>)
    : undefined;
}

function injectKind<K extends Kind>(
  kind: K,
  highlightedItem: OmitKind<K> | undefined
): SingleKindHighlightedItem<K> | undefined {
  // I'm not sure why TS can't figure this one out on its own, but this
  // reasoning is sound. We're just injecting the static kind into a value that
  // we know is of that kind.
  return highlightedItem
    ? ({ kind, ...highlightedItem } as SingleKindHighlightedItem<K>)
    : undefined;
}

export default useHighlight;
