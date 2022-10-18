import { graphql, useFragment } from "react-relay";
import { BodyPart, OverlayPosition, useBetaMoveVisualPosition } from "util/svg";
import useCurrentStance from "util/useCurrentStance";
import { BodyStance_betaMoveNodeConnection$key } from "./__generated__/BodyStance_betaMoveNodeConnection.graphql";

const defaultPositions: Record<BodyPart, OverlayPosition> = {
  LEFT_HAND: { x: 25, y: 25 },
  RIGHT_HAND: { x: 75, y: 25 },
  LEFT_FOOT: { x: 25, y: 75 },
  RIGHT_FOOT: { x: 75, y: 75 },
};

interface Props {
  betaMoveConnectionKey: BodyStance_betaMoveNodeConnection$key;
}

/**
 * A visual for the body's current position.
 */
const BodyStance: React.FC<Props> = ({ betaMoveConnectionKey }) => {
  const betaMoveConnection = useFragment(
    graphql`
      fragment BodyStance_betaMoveNodeConnection on BetaMoveNodeConnection {
        ...useCurrentStance_betaMoveNodeConnection
        edges {
          node {
            id
            bodyPart
          }
        }
      }
    `,
    betaMoveConnectionKey
  );
  // Find which moves are in the current body position
  const stance = useCurrentStance(betaMoveConnection);

  // Grab the visual position of each move
  const getPosition = useBetaMoveVisualPosition();
  const positions: Record<BodyPart, OverlayPosition> = Object.entries(
    stance
  ).reduce((acc, [bodyPart, moveId]) => {
    acc[bodyPart as BodyPart] = getPosition(moveId);
    return acc;
  }, defaultPositions);

  // Find the center between the 4 points by averaging their x and y
  // This is a rough temporary measure
  const center: OverlayPosition = Object.values(positions).reduce(
    (acc, position, i, arr) => {
      acc.x += position.x / arr.length;
      acc.y += position.y / arr.length;
      return acc;
    },
    { x: 0, y: 0 }
  );

  // Draw a line between each move and the center. This is a very rough
  // approximation of the current body position.
  return (
    <g strokeWidth={1} stroke="white" fill="none">
      <circle key="head" r={3} cx={center.x} cy={center.y} />
      {Object.entries(positions).map(([bodyPart, position]) => (
        <line
          key={bodyPart}
          x1={center.x}
          y1={center.y}
          x2={position.x}
          y2={position.y}
        />
      ))}
    </g>
  );
};

export default BodyStance;
