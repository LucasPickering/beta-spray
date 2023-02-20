import { useTheme } from "@mui/material";
import { DragFinishHandler, useDrag } from "components/Editor/util/dnd";
import { BodyPart, OverlayPosition } from "components/Editor/util/svg";
import { styleDraggable, styleDragging } from "styles/svg";
import { isDefined } from "util/func";
import Positioned from "../common/Positioned";
import BetaMoveIcon from "./BetaMoveIcon";

interface Props {
  bodyPart: BodyPart;
  variant: "move" | "stickFigure";
  onDragFinish?: DragFinishHandler<"overlayBetaMove">;
}

const offsetDistance = 4.5;
/**
 * We'll offset this component to separate it from the associated beta move.
 * The offset direction will be based on the body part.
 */
const offsets: Record<BodyPart, OverlayPosition> = {
  LEFT_HAND: { x: -offsetDistance, y: -offsetDistance },
  RIGHT_HAND: { x: offsetDistance, y: -offsetDistance },
  LEFT_FOOT: { x: -offsetDistance, y: offsetDistance },
  RIGHT_FOOT: { x: offsetDistance, y: offsetDistance },
};

/**
 * A drag handle to add a new beta move. There are two variants of this:
 *  - "move" - Associated with a particular move
 *  - "stickFigure" - Associated with a body part, but there are no moves of that
 *    body part yet
 * In either case, we'll inherit the position of the parent, although the "move"
 * variant applies its own offset on top of that.
 */
const AddBetaMoveMark: React.FC<Props> = ({
  bodyPart,
  variant,
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
  const color = palette.success.main;

  switch (variant) {
    case "move":
      return (
        <Positioned ref={drag} position={offsets[bodyPart]}>
          <g css={[styleDraggable, isDragging && styleDragging]}>
            <circle r={1.5} fill={color} />
            <IconPlusRaw />
          </g>
        </Positioned>
      );
    case "stickFigure":
      return (
        <BetaMoveIcon
          ref={drag}
          bodyPart={bodyPart}
          color={color}
          draggable
          isDragging={isDragging}
        >
          <IconPlusRaw transform="scale(1.8)" />
        </BetaMoveIcon>
      );
  }
};

const IconPlusRaw: React.FC<React.SVGProps<SVGGElement>> = (props) => {
  const lineProps = { stroke: "black", strokeWidth: 0.25 };
  const lineLength = 0.75;
  return (
    <g {...props}>
      <line x1={0} y1={-lineLength} x2={0} y2={lineLength} {...lineProps} />
      <line x1={-lineLength} y1={0} x2={lineLength} y2={0} {...lineProps} />
    </g>
  );
};

export default AddBetaMoveMark;
