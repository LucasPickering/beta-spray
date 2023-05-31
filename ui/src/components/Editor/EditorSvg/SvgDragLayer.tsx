import {
  DragItemWithKind,
  getItemWithKind,
  useDragLayer,
} from "components/Editor/util/dnd";
import { useDOMToSVGPosition } from "components/Editor/util/svg";
import { Add as IconAdd, OpenWith as IconOpenWith } from "@mui/icons-material";
import { useTheme } from "@mui/material";
import Positioned from "./common/Positioned";
import BetaMoveIcon from "./BetaEditor/BetaMoveIcon";
import HoldIcon from "./HoldEditor/HoldIcon";

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
      <SvgDragPreview itemWithKind={itemWithKind} />;
    </Positioned>
  );
};

const SvgDragPreview: React.FC<{
  itemWithKind: DragItemWithKind;
}> = ({ itemWithKind }) => {
  const { palette } = useTheme();

  switch (itemWithKind.kind) {
    case "overlayHold":
      return <HoldIcon draggable isDragging />;
    case "overlayBetaMove": {
      const { item } = itemWithKind;
      switch (item.action) {
        case "create":
          // We don't know what order the move is/will be, so don't show text
          return (
            <BetaMoveIcon
              bodyPart={item.bodyPart}
              color={palette.editor.actions.create.main}
              icon={<IconAdd />}
              isDragging
            />
          );
        case "relocate":
          return (
            <BetaMoveIcon
              bodyPart={item.bodyPart}
              color={palette.editor.actions.relocate.main}
              icon={<IconOpenWith />}
              isDragging
            ></BetaMoveIcon>
          );
        default:
          return null;
      }
    }
    default:
      // All other drag types should be handled by other preview layers
      return null;
  }
};

export default SvgDragLayer;
