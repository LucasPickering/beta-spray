import React from "react";
import {
  BodyPart,
  getMidpoint,
  OverlayPosition,
  useBetaMoveVisualPosition,
} from "util/svg";
import useCurrentStance from "util/useCurrentStance";
import { useCurrentStance_betaMoveNodeConnection$key } from "util/__generated__/useCurrentStance_betaMoveNodeConnection.graphql";
import Line from "../Line";
import StickFigureDragHandle from "./StickFigureDragHandle";

const defaultPositions: Record<BodyPart, OverlayPosition> = {
  // TODO can we calculate actual center mark, using svg coordinates?
  LEFT_HAND: { x: 25, y: 25 },
  RIGHT_HAND: { x: 75, y: 25 },
  LEFT_FOOT: { x: 25, y: 75 },
  RIGHT_FOOT: { x: 75, y: 75 },
};

interface Props {
  betaMoveConnectionKey: useCurrentStance_betaMoveNodeConnection$key;
}

/**
 * A visual for the body's current position.
 */
const StickFigure: React.FC<Props> = ({ betaMoveConnectionKey }) => {
  // Find which moves are in the current body position
  const stance = useCurrentStance(betaMoveConnectionKey);

  // Grab the visual position of each move
  const getPosition = useBetaMoveVisualPosition();
  const positions: Record<BodyPart, OverlayPosition> = Object.entries(
    stance
  ).reduce((acc, [bodyPart, moveId]) => {
    acc[bodyPart as BodyPart] = getPosition(moveId);
    return acc;
  }, defaultPositions);

  const shoulders = getMidpoint(positions.LEFT_HAND, positions.RIGHT_HAND);
  const hips = getMidpoint(positions.LEFT_FOOT, positions.RIGHT_FOOT);

  // Draw an approximate stick figure. There is some code dupe here, but IMO
  // it's better than trying to generalize it for only 4 use cases.
  return (
    <g strokeWidth={1} stroke="white" fill="none">
      {/* Head */}
      <circle r={3} cx={shoulders.x} cy={shoulders.y} />
      {/* Torso */}
      <Line p1={shoulders} p2={hips} />

      {!stance.LEFT_HAND && (
        <StickFigureDragHandle
          bodyPart="LEFT_HAND"
          position={positions.LEFT_HAND}
        />
      )}
      <Line p1={positions.LEFT_HAND} p2={shoulders} />

      {!stance.RIGHT_HAND && (
        <StickFigureDragHandle
          bodyPart="RIGHT_HAND"
          position={positions.RIGHT_HAND}
        />
      )}
      <Line p1={positions.RIGHT_HAND} p2={shoulders} />

      {!stance.LEFT_FOOT && (
        <StickFigureDragHandle
          bodyPart="LEFT_FOOT"
          position={positions.LEFT_FOOT}
        />
      )}
      <Line p1={positions.LEFT_FOOT} p2={hips} />

      {!stance.RIGHT_FOOT && (
        <StickFigureDragHandle
          bodyPart="RIGHT_FOOT"
          position={positions.RIGHT_FOOT}
        />
      )}
      <Line p1={positions.RIGHT_FOOT} p2={hips} />
    </g>
  );
};

export default StickFigure;
