import { useTheme } from "@mui/material";
import { DragFinishHandler, useDrag } from "components/Editor/util/dnd";
import {
  add,
  BodyPart,
  OverlayPosition,
  useBetaMoveVisualPosition,
} from "components/Editor/util/svg";
import { graphql, useFragment } from "react-relay";
import { styleDraggable, styleDragging } from "styles/svg";
import { isDefined } from "util/func";
import Positioned from "../common/Positioned";
import { AddBetaMoveMark_betaMoveNode$key } from "./__generated__/AddBetaMoveMark_betaMoveNode.graphql";

interface Props {
  betaMoveKey: AddBetaMoveMark_betaMoveNode$key;
  onDragFinish?: DragFinishHandler<"overlayBetaMove", "dropZone" | "hold">;
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
 * A drag handle to add a new beta move. This should be associated with a
 * particular move.
 */
const AddBetaMoveMark: React.FC<Props> = ({ betaMoveKey, onDragFinish }) => {
  const betaMove = useFragment(
    graphql`
      fragment AddBetaMoveMark_betaMoveNode on BetaMoveNode {
        id
        bodyPart
        isLastInChain
      }
    `,
    betaMoveKey
  );

  const position = useBetaMoveVisualPosition()(betaMove.id);

  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: betaMove.isLastInChain
      ? {
          action: "create",
          bodyPart: betaMove.bodyPart,
        }
      : {
          action: "insertAfter",
          bodyPart: betaMove.bodyPart,
          betaMoveId: betaMove.id,
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

  return (
    <Positioned ref={drag} position={add(position, offsets[betaMove.bodyPart])}>
      <IconAddBetaMoveRaw css={[styleDraggable, isDragging && styleDragging]} />
    </Positioned>
  );
};

const IconAddBetaMoveRaw: React.FC<React.SVGProps<SVGPathElement>> = (
  props
) => {
  const { palette } = useTheme();
  return (
    <g {...props}>
      <circle r={1.5} fill={palette.success.main} />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={3}
        fill={palette.getContrastText(palette.success.main)}
      >
        +
      </text>
    </g>
  );
};

export default AddBetaMoveMark;
