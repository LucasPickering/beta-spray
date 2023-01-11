import { useDrag } from "components/Editor/util/dnd";
import { add, useBetaMoveVisualPosition } from "components/Editor/util/svg";
import { graphql, useFragment } from "react-relay";
import { styleDraggable, styleDragging } from "styles/svg";
import Positioned from "../common/Positioned";
import { AddBetaMoveMark_betaMoveNode$key } from "./__generated__/AddBetaMoveMark_betaMoveNode.graphql";

interface Props {
  betaMoveKey: AddBetaMoveMark_betaMoveNode$key;
}

/**
 * TODO
 */
const AddBetaMoveMark: React.FC<Props> = ({ betaMoveKey }) => {
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
  });

  return (
    <Positioned ref={drag} position={add(position, { x: 5, y: 5 })}>
      <g css={[styleDraggable, isDragging && styleDragging]}>
        <circle r={1.5} fill="green" />
      </g>
    </Positioned>
  );
};

export default AddBetaMoveMark;
