import { DragFinishHandler, useDrag } from "components/Editor/util/dnd";
import { BodyPart, OverlayPosition } from "components/Editor/util/svg";
import { isDefined } from "util/func";
import Positioned from "../common/Positioned";
import BetaMoveIcon from "./BetaMoveIcon";

interface Props {
  bodyPart: BodyPart;
  position: OverlayPosition;
  onDragFinish?: DragFinishHandler<"overlayBetaMove">;
}

const StickFigureDragHandle: React.FC<Props> = ({
  bodyPart,
  position,
  onDragFinish,
}) => {
  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: {
      action: "create",
      bodyPart,
    },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end(draggedItem, monitor) {
      const dropResult = monitor.getDropResult();
      if (onDragFinish && isDefined(dropResult)) {
        onDragFinish(draggedItem, dropResult, monitor);
      }
    },
  });

  return (
    <Positioned ref={drag} position={position}>
      <BetaMoveIcon bodyPart={bodyPart} draggable isDragging={isDragging} />
    </Positioned>
  );
};

export default StickFigureDragHandle;
