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
  DragSourceMonitor,
  DropTargetMonitor,
} from "react-dnd";
import { BodyPart, OverlayPosition } from "./svg";
import { DistributivePick } from "util/typing";

/**
 * The classes of things we can drag, and the metadata attached to each
 * drag/drop object in those universes.
 */
export type DragType =
  | {
      kind: "overlayHold";
      item: { action: "relocate"; holdId: string };
      drop: { kind: "dropZone"; position: OverlayPosition };
    }
  | {
      kind: "overlayBetaMove";
      item: // Create a new move (dragging from palette)
      | { action: "create"; bodyPart: BodyPart }
        // Relocate an existing move to a new hold/position
        | { action: "relocate"; bodyPart: BodyPart; betaMoveId: string }
        // Insert a new move *after* the dragged one (dragging a line)
        | { action: "insertAfter"; bodyPart: BodyPart; betaMoveId: string };
      // hold => attached move
      // drop zone => free move
      drop:
        | { kind: "hold"; holdId: string; position: OverlayPosition }
        | { kind: "dropZone"; position: OverlayPosition };
    }
  | {
      kind: "listBetaMove";
      item: {
        betaMoveId: string;
        // This is *similar to* the move's order, but with a couple critical
        // differences:
        // - `order` is 1-indexed, this is 0-indexed. I chose not to make them
        //    to prevent logic mistakes w/ array reordering, but that means we
        //    we have +1 when setting order
        // - While reordering moves, this index will change, but `order` won't
        //    be updated until the user stops dragging and the API call is sent
        index: number;
      };
      drop: { kind: "list" };
    };

/**
 * `DragType`, but restricted to a specific set of variants.
 */
export type DragTypeForKind<K extends DragKind> = Extract<
  DragType,
  { kind: K }
>;

/**
 * A drag item paired with its drag kind. In most cases we can just use DragItem
 * since only a single kind is available in context, but sometimes we need to
 * handle items of multiple kinds, so we need to pair the data.
 */
export type DragItemWithKind<K extends DragKind = DragKind> = DistributivePick<
  DragTypeForKind<K>,
  "kind" | "item"
>;

/**
 * The different "kinds" of dragging we can do. Each of these is a possible
 * value for the `type` input to useDrag/useDrop.
 */
export type DragKind = DragType["kind"];

/**
 * The metadata attached to a drag item, for a particular kind of dragging.
 */
export type DragItem<K extends DragKind = DragKind> =
  DragTypeForKind<K>["item"];

/**
 * The result of dropping an item, for a particular class of dnd.
 */
export type DropResult<K extends DragKind = DragKind> =
  DragTypeForKind<K>["drop"];

/**
 * A handler to be called *from a drag item* when a drag is finished. User must
 * declare both the expected drag item type as well as the expected drop type.
 * In most contexts where this is used, both will be known statically and thus
 * it makes our lives a bit easier.
 */
export type DragFinishHandler<
  K extends DragKind,
  J extends DropResult<K>["kind"]
> = (
  item: DragItem<K>,
  result: Extract<DropResult<K>, { kind: J }>,
  monitor: DragSourceMonitor<DragItem<K>, DropResult<K>>
) => void;

/**
 * An onDrop handler. User must declare both the expected drag item type as
 * well as the expected drop type. In most contexts where this is used, both
 * will be known statically and thus it makes our lives a bit easier.
 */
export type DropHandler<K extends DragKind, J extends DropResult<K>["kind"]> = (
  item: DragItem<K>,
  result: Extract<DropResult<K>, { kind: J }>,
  monitor: DropTargetMonitor<DragItem<K>, DropResult<K>>
) => void;

/**
 * Type of the object argument passed to useDrag.
 */
export type DragSpec<
  K extends DragKind,
  CollectedProps = unknown
> = FactoryOrInstance<
  DragSourceHookSpec<DragItem<K>, DropResult<K>, CollectedProps>
> & { type: K };

/**
 * Wrapper around react-dnd's useDrag that enforces better typing.
 */
export function useDrag<K extends DragKind, CollectedProps = unknown>(
  specArg: DragSpec<K, CollectedProps>,
  deps?: unknown[]
): [CollectedProps, ConnectDragSource, ConnectDragPreview] {
  return useDragBase(specArg, deps);
}

/**
 * Type of the object argument passed to useDrop.
 */
type DropSpec<
  K extends DragKind,
  CollectedProps = unknown
> = DropTargetHookSpec<DragItem<K>, DropResult<K>, CollectedProps> & {
  // We can accept one or more types, as supported by the vanilla useDrop. If
  // an array is passed here, K will implicitly be widened to include all
  // the given variants.
  accept: K | K[];
};

/**
 * Wrapper around react-dnd's useDrop that enforces better typing.
 */
export function useDrop<K extends DragKind, CollectedProps = unknown>(
  specArg: DropSpec<K, CollectedProps>,
  deps?: unknown[]
): [CollectedProps, ConnectDropTarget] {
  return useDropBase(specArg, deps);
}

/**
 * Wrapper around react-dnd's useDragLayer that enforces better typing.
 */
export function useDragLayer<CollectedProps = Record<string, unknown>>(
  collect: (monitor: DragLayerMonitor<DragItem>) => CollectedProps
): CollectedProps {
  return useDragLayerBase<CollectedProps, DragItem>(collect);
}

/**
 * In most places, we only support a single drag kind so we don't ever need to
 * differentiate between variants. Sometimes we do handle multiple kinds though.
 * It's not easy to plumb that data through DnD, so this util function makes it
 * easy to bind the kind and item together, so we can use a switch statement
 * and get type narrowing.
 *
 * This uses some type hackery, but if your types are set up correctly
 * everywhere else (which *should* be guaranteed by the type system), then it's
 * no problem.
 *
 * @param monitor Monitor from react-dnd. Can be any monitor type
 *  (drag source, drop target, or drag layer)
 * @returns Kind and item together.
 */
export function getItemWithKind<K extends DragKind>(
  monitor: Pick<
    DragSourceMonitor<DragItem<K>, DropResult<K>>,
    "getItem" | "getItemType"
  >
): DragItemWithKind<K> {
  // Type hackery, since we can't pass enough info through the monitor.
  // We're relying on the rest of the type structure to be sound here.
  const kind = monitor.getItemType() as unknown as K;
  const item = monitor.getItem();
  return { kind, item } as DragItemWithKind<K>;
}
