import { useDrag } from "util/dnd";
import { BodyPart, OverlayPosition } from "util/svg";
import Positioned from "../common/Positioned";
import BetaMoveIcon from "./BetaMoveIcon";

interface Props {
  bodyPart: BodyPart;
  position: OverlayPosition;
}

const StickFigureDragHandle: React.FC<Props> = ({ bodyPart, position }) => {
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
  });

  return (
    <Positioned ref={drag} position={position}>
      <BetaMoveIcon bodyPart={bodyPart} draggable isDragging={isDragging} />
    </Positioned>
  );
};

export default StickFigureDragHandle;
