import { OverlayPosition } from "components/Editor/util/svg";

interface Props extends React.SVGProps<SVGLineElement> {
  p1: OverlayPosition;
  p2: OverlayPosition;
}

/**
 * An SVG line between two points. Simple convenience component for rendering
 * a line between composite position values.
 */
const Line: React.FC<Props> = ({ p1, p2, ...rest }) => (
  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} {...rest} />
);

export default Line;
