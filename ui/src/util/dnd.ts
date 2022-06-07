import {
  // These are the O.G. approved imports
  /* eslint-disable no-restricted-syntax */
  useDrag as useDragBase,
  useDrop as useDropBase,
  useDragLayer as useDragLayerBase,
  /* eslint-enable no-restricted-syntax */
  ConnectDragPreview,
  ConnectDragSource,
  DragSourceHookSpec,
  FactoryOrInstance,
  DropTargetHookSpec,
  ConnectDropTarget,
  DragLayerMonitor,
} from "react-dnd";
import { BodyPart, OverlayPosition } from "./svg";
import { DistributivePick } from "./types";

/**
 * The classes of things we can drag, and the metadata attached to each
 * drag/drop object in those universes.
 */
export type DragType =
  | {
      kind: "holdOverlay";
      item: { holdId: string };
      drop: { position: OverlayPosition };
    }
  | {
      kind: "betaMoveOverlay";
      item: // Dragging a move around
      | { kind: "move"; betaMoveId: string; bodyPart: BodyPart }
        // Dragging a line between two moves (to insert a move)
        | { kind: "line"; startMoveId: string; bodyPart: BodyPart };
      drop: { kind: "hold"; holdId: string };
    }
  | {
      kind: "betaMoveList";
      item: {
        betaMoveId: string;
        // This is *similar to* the move's order, but with a couple critical
        // differences:
        // - `order` is 1-indexed, this is 0-indexed. I chose not to make them
        //    to prevent logic mistakes w/ array reordering, but that means we
        //    we have +1 when setting order
        // - While reordering moves, this index will change, but `order won't
        //    be updated until the user stops dragging and the API call is sent
        index: number;
      };
      drop: undefined;
    };

/**
 * A drag item paired with its drag kind. In most cases we can just use DragItem
 * since only a single kind is available in context, but sometimes we need to
 * handle items of multiple kinds, so we need to pair the data.
 */
export type DragItemWithKind = DistributivePick<DragType, "kind" | "item">;

/**
 * The different "kinds" of dragging we can do. Each of these is a possible
 * value for the `type` input to useDrag/useDrop.
 */
export type DragKind = DragType["kind"];

/**
 * The metadata attached to a drag item, for a particular kind of dragging.
 */
export type DragItem<K extends DragKind = DragKind> = Extract<
  DragType,
  { kind: K }
>["item"];

/**
 * The result of dropping an item, for a particular class of dnd.
 */
export type DropResult<K extends DragKind = DragKind> = Extract<
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
 * Wrapper around react-dnd's useDrop that enforces better typing.
 */
export function useDrop<K extends DragKind, CollectedProps = unknown>(
  specArg: FactoryOrInstance<
    DropTargetHookSpec<DragItem<K>, DropResult<K>, CollectedProps>
  > & { accept: K },
  deps?: unknown[]
): [CollectedProps, ConnectDropTarget] {
  return useDropBase(specArg, deps);
}

/**
 * Wrapper around react-dnd's useDragLayer that enforces better typing.
 */
export function useDragLayer<CollectedProps = unknown>(
  collect: (monitor: DragLayerMonitor<DragItem>) => CollectedProps
): CollectedProps {
  return useDragLayerBase(collect);
}
