import React from "react";
import { DragItemWithKind, DragKind, useDragLayer } from "util/dnd";
import { useOverlayUtils } from "util/useOverlayUtils";
import DragPreview from "./DragPreview";
import Positioned from "./Positioned";

const layerStyles: React.CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
};

interface Props {
  mode: "html" | "svg";
}

export const DragLayer: React.FC<Props> = ({ mode }) => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer(
    (monitor) => ({
      itemType: monitor.getItemType(),
      item: monitor.getItem(),
      currentOffset: monitor.getSourceClientOffset(),
      isDragging: monitor.isDragging(),
    })
  );
  // This hook shouldn't do anything in HTML mode
  const { toSvgPosition } = useOverlayUtils();

  // These should all be truthy at the same time, but check all 3 to convince TS
  if (!isDragging || !itemType || !currentOffset) {
    return null;
  }

  // Type hack here. *We* know that itemType corresponds to the `kind`
  // field of DragType, and the type of `item` will match the
  // corresponding kind, but there's no way to pass that info through
  // dnd. We *could* do a type guard here to safety check, but it's
  // easier just to trust that the data went in correctly.
  const itemWithKind = { kind: itemType as DragKind, item } as DragItemWithKind;

  if (mode === "html") {
    return (
      <div style={layerStyles}>
        <div
          style={{
            transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
          }}
        >
          <DragPreview mode={mode} itemWithKind={itemWithKind} />
        </div>
      </div>
    );
  }

  // We're in SVG mode: translate coords from DOM to SVG, then shift the preview
  return (
    <Positioned position={toSvgPosition(currentOffset)}>
      <DragPreview mode={mode} itemWithKind={itemWithKind} />;
    </Positioned>
  );
};
