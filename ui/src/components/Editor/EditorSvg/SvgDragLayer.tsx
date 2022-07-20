import React from "react";
import { getItemWithKind, useDragLayer } from "util/dnd";
import { useDOMToSVGPosition } from "util/svg";
import DragPreview from "./SvgDragPreview";
import Positioned from "./Positioned";

const SvgDragLayer: React.FC = () => {
  const { itemWithKind, currentOffset } = useDragLayer((monitor) => ({
    itemWithKind: getItemWithKind(monitor),
    currentOffset: monitor.getClientOffset(),
  }));

  const domToSVGPosition = useDOMToSVGPosition();

  // Should be truthy iff dragging
  if (!currentOffset) {
    return null;
  }

  // Translate coords from DOM to SVG, then shift the preview
  return (
    <Positioned position={domToSVGPosition(currentOffset)}>
      <DragPreview itemWithKind={itemWithKind} />;
    </Positioned>
  );
};

export default SvgDragLayer;
