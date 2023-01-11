import React from "react";
import {
  add,
  BodyPart,
  midpoint,
  multiply,
  OverlayPosition,
  subtract,
  unit,
  useBetaMoveVisualPosition,
} from "components/Editor/util/svg";
import useCurrentStance from "components/Editor/util/useCurrentStance";
import { useCurrentStance_betaMoveNodeConnection$key } from "../../util/__generated__/useCurrentStance_betaMoveNodeConnection.graphql";
import Line from "../common/Line";
import StickFigureDragHandle from "./StickFigureDragHandle";

/**
 * The torso will always be this percentage of the distance between hands and
 * feet midpoints.
 */
const torsoLengthRatio = 0.5;

const headRadius = 3;

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
  ).reduce(
    (acc, [bodyPart, moveId]) => {
      acc[bodyPart as BodyPart] = getPosition(moveId);
      return acc;
    },
    { ...defaultPositions }
  );

  // Calculate some rough positions for shoulder and hips. We'll calculate
  // midpoint of hands, then feet, and make the torso some fixed percentage of
  // the distance between those two. Shoulders and hips are the ends of the torso.
  // Let's do some GEOMETRY (thank u mr mallia)
  const handsMidpoint = midpoint(positions.LEFT_HAND, positions.RIGHT_HAND);
  const feetMidpoint = midpoint(positions.LEFT_FOOT, positions.RIGHT_FOOT);

  // Get the vector displacement between the two points
  const diff = subtract(handsMidpoint, feetMidpoint);
  // The ratio between each midpoint and the torso end. E.g. distance from
  // hands midpoint to shoulders, as a percentage of hands=>feet distance
  const offsetRatio = (1.0 - torsoLengthRatio) / 2;

  const shoulders = subtract(handsMidpoint, multiply(diff, offsetRatio));
  const hips = add(feetMidpoint, multiply(diff, offsetRatio));
  // Project the torso out a bit further to place the head. We use a fudge factor
  // on the radius to overcome the width of the arm/torso lines
  const head = add(shoulders, multiply(unit(diff), headRadius * 1.3));

  // Draw an approximate stick figure
  const limbs: Array<{ bodyPart: BodyPart; joint: OverlayPosition }> = [
    { bodyPart: "LEFT_HAND", joint: shoulders },
    { bodyPart: "RIGHT_HAND", joint: shoulders },
    { bodyPart: "LEFT_FOOT", joint: hips },
    { bodyPart: "RIGHT_FOOT", joint: hips },
  ];
  return (
    <g strokeWidth={1} stroke="#dddddd" fill="none">
      {/* Head */}
      <circle r={headRadius} cx={head.x} cy={head.y} />
      {/* Torso */}
      <Line p1={shoulders} p2={hips} />

      {limbs.map(({ bodyPart, joint }) => (
        <React.Fragment key={bodyPart}>
          <Line p1={positions[bodyPart]} p2={joint} />
          {!stance[bodyPart] && (
            <StickFigureDragHandle
              bodyPart={bodyPart}
              position={positions[bodyPart]}
            />
          )}
        </React.Fragment>
      ))}
    </g>
  );
};

export default StickFigure;
