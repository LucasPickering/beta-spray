import { graphql, useFragment } from "react-relay";
import { OverlayPosition, useBetaMoveVisualPosition } from "util/svg";
import useBodyState from "util/useBodyState";
import { BodyState_betaMoveNodeConnection$key } from "./__generated__/BodyState_betaMoveNodeConnection.graphql";

interface Props {
  betaMoveConnectionKey: BodyState_betaMoveNodeConnection$key;
}

/**
 * A visual for the body's current position on a given move.
 *
 * A more climber-familiar name for this would be BodyPosition, but I thought
 * including Position in the name could make it easy to confuse with coordinate-like
 * types, hence BodyState instead.
 */
const BodyState: React.FC<Props> = ({ betaMoveConnectionKey }) => {
  const betaMoveConnection = useFragment(
    graphql`
      fragment BodyState_betaMoveNodeConnection on BetaMoveNodeConnection {
        ...useBodyState_betaMoveNodeConnection
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
  const moveIds = useBodyState(betaMoveConnection);

  // Grab the visual position of each move
  const getPosition = useBetaMoveVisualPosition();
  const moves = moveIds.map((moveId) => ({
    id: moveId,
    position: getPosition(moveId),
  }));

  // Find the center between the 4 points by averaging their x and y
  // This is a rough temporary measure
  const center: OverlayPosition = moves.reduce(
    (acc, { position }) => {
      acc.x += position.x / moveIds.length;
      acc.y += position.y / moveIds.length;
      return acc;
    },
    { x: 0, y: 0 }
  );

  // Draw a line between each move and the center. This is a very rough
  // approximation of the current body position.
  return (
    <>
      {moves.map((move) => (
        <line
          key={move.id}
          stroke="white"
          strokeWidth={1}
          x1={center.x}
          y1={center.y}
          x2={move.position.x}
          y2={move.position.y}
        />
      ))}
    </>
  );
};

export default BodyState;
