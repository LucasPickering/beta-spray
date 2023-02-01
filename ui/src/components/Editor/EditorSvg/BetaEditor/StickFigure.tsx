import React, { useContext } from "react";
import {
  add,
  BodyPart,
  Dimensions,
  midpoint,
  multiply,
  OverlayPosition,
  subtract,
  unit,
  useBetaMoveVisualPosition,
} from "components/Editor/util/svg";
import { stance_betaMoveNodeConnection$key } from "../../util/__generated__/stance_betaMoveNodeConnection.graphql";
import Line from "../common/Line";
import StickFigureDragHandle from "./StickFigureDragHandle";
import { useStance } from "components/Editor/util/stance";
import { SvgContext } from "components/Editor/util/context";
import { DragFinishHandler } from "components/Editor/util/dnd";

/**
 * The torso will always be this percentage of the distance between hands and
 * feet midpoints.
 */
const torsoLengthRatio = 0.5;

const headRadius = 3;

interface Props {
  betaMoveConnectionKey: stance_betaMoveNodeConnection$key;
  onDragFinish?: DragFinishHandler<"overlayBetaMove", "dropZone" | "hold">;
}

/**
 * A visual for the body's current position.
 */
const StickFigure: React.FC<Props> = ({
  betaMoveConnectionKey,
  onDragFinish,
}) => {
  // Find which moves are in the current body position
  const stance = useStance(betaMoveConnectionKey);
  const { dimensions: svgDimensions } = useContext(SvgContext);

  // Grab the visual position of each move
  const getPosition = useBetaMoveVisualPosition();
  const positions: Record<BodyPart, OverlayPosition> = Object.entries(
    stance
  ).reduce((acc, [bodyPart, moveId]) => {
    acc[bodyPart as BodyPart] = getPosition(moveId);
    return acc;
  }, getDefaultPositions(svgDimensions));

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
              onDragFinish={onDragFinish}
            />
          )}
        </React.Fragment>
      ))}
    </g>
  );
};

function getDefaultPositions(
  svgDimensions: Dimensions
): Record<BodyPart, OverlayPosition> {
  const x1 = svgDimensions.width / 4;
  const x2 = x1 * 3;
  const y1 = svgDimensions.height / 4;
  const y2 = y1 * 3;
  return {
    LEFT_HAND: { x: x1, y: y1 },
    RIGHT_HAND: { x: x2, y: y1 },
    LEFT_FOOT: { x: x1, y: y2 },
    RIGHT_FOOT: { x: x2, y: y2 },
  };
}

export default StickFigure;
