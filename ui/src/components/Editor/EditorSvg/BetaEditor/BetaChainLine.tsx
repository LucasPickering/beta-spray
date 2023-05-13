import { graphql } from "relay-runtime";
import { useFragment } from "react-relay";
import {
  useBetaMoveColor,
  useBetaMoveVisualPosition,
} from "components/Editor/util/moves";
import { getEditableFilterUrl } from "../EditableFilter";
import { BetaChainLine_startBetaMoveNode$key } from "./__generated__/BetaChainLine_startBetaMoveNode.graphql";
import { BetaChainLine_endBetaMoveNode$key } from "./__generated__/BetaChainLine_endBetaMoveNode.graphql";

interface Props {
  startMoveKey: BetaChainLine_startBetaMoveNode$key;
  endMoveKey: BetaChainLine_endBetaMoveNode$key;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainLine: React.FC<Props> = ({ startMoveKey, endMoveKey }) => {
  const startMove = useFragment(
    graphql`
      fragment BetaChainLine_startBetaMoveNode on BetaMoveNode {
        id
        bodyPart
      }
    `,
    startMoveKey
  );
  const endMove = useFragment(
    graphql`
      fragment BetaChainLine_endBetaMoveNode on BetaMoveNode {
        id
      }
    `,
    endMoveKey
  );

  const getPosition = useBetaMoveVisualPosition();
  const startPos = getPosition(startMove.id);
  const endPos = getPosition(endMove.id);
  const coords = {
    x1: startPos.x,
    y1: startPos.y,
    x2: endPos.x,
    y2: endPos.y,
  };

  // Color will be a gradient between the two moves
  const gradientId = `${startMove.id}_${endMove.id}`;
  const getColors = useBetaMoveColor();
  const startColor = getColors(startMove.id);
  const endColor = getColors(endMove.id);

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          {...coords}
        >
          <stop stopColor={startColor} offset="0" />
          <stop stopColor={endColor} offset="1" />
        </linearGradient>
      </defs>
      <line
        css={{ strokeWidth: 0.5 }}
        filter={getEditableFilterUrl("beta")} // Color based on editability
        stroke={`url(#${gradientId})`}
        strokeDasharray="1.5 1"
        {...coords}
      />
    </>
  );
};

export default BetaChainLine;
