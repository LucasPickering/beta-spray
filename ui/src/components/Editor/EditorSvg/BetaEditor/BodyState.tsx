import { useTheme } from "@mui/material";
import { useContext } from "react";
import { graphql, useFragment } from "react-relay";
import { EditorHighlightedMoveContext } from "util/context";
import { BodyPart, OverlayPosition, useBetaMoveVisualPosition } from "util/svg";
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
  const { palette } = useTheme();
  const [highlightedMove] = useContext(EditorHighlightedMoveContext);
  const getPosition = useBetaMoveVisualPosition();

  if (!highlightedMove) {
    return null;
  }

  // Find the most recent position of each body part at the point of the
  // highlighted move. Moves should always be sorted by order!
  const lastMoves: Map<
    BodyPart,
    // Just pull out the fields we need
    { id: string; position: OverlayPosition }
  > = new Map();
  for (const edge of betaMoveConnection.edges) {
    const move = edge.node;
    lastMoves.set(move.bodyPart, {
      id: move.id,
      position: getPosition(move.id),
    });

    // If we've reached the highlighted move, everything after is irrelevant
    if (move.id === highlightedMove) {
      break;
    }
  }

  // Find the center between the 4 points by averaging their x and y
  const values = Array.from(lastMoves.values());
  const center: OverlayPosition = values.reduce(
    (acc, { position }) => {
      acc.x += position.x / values.length;
      acc.y += position.y / values.length;
      return acc;
    },
    { x: 0, y: 0 }
  );

  // Draw a line between each move and the center. This is a very rough
  // approximation of the current body position.
  return (
    <>
      {values.map((move) => (
        <line
          key={move.id}
          stroke={palette.secondary.main}
          strokeWidth={0.6}
          strokeDasharray="2,2"
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
