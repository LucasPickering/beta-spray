import { isDefined } from "util/func";
import { useTheme } from "@mui/material";
import { DragFinishHandler, useDrag } from "components/Editor/util/dnd";
import { BodyPart } from "components/Editor/util/svg";
import { Add as IconAdd } from "@mui/icons-material";
import BetaMoveIcon from "./BetaMoveIcon";

interface Props {
  bodyPart: BodyPart;
  onDragFinish?: DragFinishHandler<"overlayBetaMove">;
}

/**
 * A drag handle to add a new beta move. We'll inherit the position of the parent.
 */
const AddBetaMoveMark: React.FC<Props> = ({ bodyPart, onDragFinish }) => {
  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: {
      action: "create",
      bodyPart,
    },
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
    end(draggedItem, monitor) {
      const dropResult = monitor.getDropResult();
      if (onDragFinish && isDefined(dropResult)) {
        onDragFinish(draggedItem, dropResult, monitor);
      }
    },
  });
  const { palette } = useTheme();
  const color = palette.editor.actions.create.main;

  // TODO add onClick tooltip give drag hint

  return (
    <BetaMoveIcon
      ref={drag}
      bodyPart={bodyPart}
      color={color}
      draggable
      icon={<IconAdd />}
      isDragging={isDragging}
    />
  );
};

export default AddBetaMoveMark;
