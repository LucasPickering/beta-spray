import { getItemWithKind, useDragLayer } from "components/Editor/util/dnd";
import { useDOMToSVGPosition } from "components/Editor/util/svg";
import DragPreview from "./SvgDragPreview";
import Positioned from "./common/Positioned";

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
