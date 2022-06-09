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
      // Dragging either a move or a line around, to add a new move. In the case
      // of lines, the move should be the *start* of the line
      item: { kind: "move" | "line"; betaMoveId: string; bodyPart: BodyPart };
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
 * Collected props that are always provided by useDragLayer
 */
interface BaseCollectedProps {
  itemWithKind: DragItemWithKind;
}

/**
 * Wrapper around react-dnd's useDragLayer that enforces better typing.
 */
export function useDragLayer<CollectedProps = Record<string, unknown>>(
  collect: (monitor: DragLayerMonitor<DragItem>) => CollectedProps
): BaseCollectedProps & CollectedProps {
  return useDragLayerBase<BaseCollectedProps & CollectedProps, DragItem>(
    (monitor) => ({
      ...collect(monitor),
      // Type hack here. *We* know that itemType corresponds to the `kind`
      // field of DragType, and the type of `item` will match the
      // corresponding kind, but there's no way to pass that info through
      // dnd. We *could* do a type guard here to safety check, but it's
      // easier just to trust that the data went in correctly.
      itemWithKind: {
        kind: monitor.getItemType() as DragKind,
        item: monitor.getItem(),
      } as DragItemWithKind,
    })
  );
}
