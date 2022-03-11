import {
  // These are the O.G. approved imports
  // eslint-disable-next-line no-restricted-syntax
  useDrag as useDragBase,
  // These are the O.G. approved imports
  // eslint-disable-next-line no-restricted-syntax
  useDrop as useDropBase,
  ConnectDragPreview,
  ConnectDragSource,
  DragSourceHookSpec,
  FactoryOrInstance,
  DropTargetHookSpec,
  ConnectDropTarget,
} from "react-dnd";
import {
  BetaOverlayMove,
  OverlayPosition,
} from "components/Editor/EditorOverlay/types";

/**
 * The classes of things we can drag, and the metadata attached to each
 * drag/drop object in those universes.
 */
export type DragType =
  | {
      kind: "holdSvg";
      item: { holdId: string };
      drop: { position: OverlayPosition };
    }
  | {
      kind: "betaMoveSvg";
      item: // Dragging a move around
      | { kind: "move"; move: BetaOverlayMove; isLast: boolean }
        // Dragging a line between two moves (to insert a move)
        | { kind: "line"; startMove: BetaOverlayMove };
      drop: { kind: "hold"; holdId: string };
    }
  | {
      kind: "betaMoveList";
      item: {
        betaMoveId: string;
        // This is *not necessarily* the move's order, it's the visible index
        // in the list. The two can mismatch while dragging, since order isn't
        // saved until dropping
        index: number;
      };
      drop: undefined;
    };

/**
 * The different "kinds" of dragging we can do. Each of these is a possible
 * value for the `type` input to useDrag/useDrop.
 */
export type DragKind = DragType["kind"];

/**
 * The metadata attached to a drag item, for a particular kind of dragging.
 */
export type DragItem<K extends DragKind> = Extract<
  DragType,
  { kind: K }
>["item"];

/**
 * The result of dropping an item, for a particular class of dnd.
 */
export type DropResult<K extends DragKind> = Extract<
  DragType,
  { kind: K }
>["drop"];

/**
 * An onDrop handler
 */
export type DropHandler<K extends DragKind> = (
  item: DragItem<K>,
  result: DropResult<K>
) => void;

/**
 * Wrapper around react-dnd's useDrag that enforces better typing.
 */
export function useDrag<K extends DragKind, CollectedProps = unknown>(
  specArg: FactoryOrInstance<
    DragSourceHookSpec<DragItem<K>, DropResult<K>, CollectedProps>
  > & { type: K },
  deps?: unknown[]
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
  return useDragBase(specArg, deps);
}

/**
 * Wrapper around react-dnd's useDrag that enforces better typing.
 */
export function useDrop<K extends DragKind, CollectedProps = unknown>(
  specArg: FactoryOrInstance<
    DropTargetHookSpec<DragItem<K>, DropResult<K>, CollectedProps>
  > & { accept: K },
  deps?: unknown[]
): [CollectedProps, ConnectDropTarget] {
  return useDropBase(specArg, deps);
}
