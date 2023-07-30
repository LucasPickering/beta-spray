import { Portal, useTheme } from "@mui/material";
import { useContext, useId } from "react";
import {
  OverlayPosition,
  add,
  useDOMToSVGPosition,
} from "components/Editor/util/svg";
import { SvgContext } from "components/Editor/util/context";
import Positioned from "./Positioned";

type Placement = "top" | "top-right" | "bottom" | "left" | "right";

const placementParams: Record<
  Placement,
  { textAnchor: string; offset: OverlayPosition }
> = {
  top: { textAnchor: "middle", offset: { x: 0, y: -8 } },
  "top-right": { textAnchor: "start", offset: { x: 4, y: -8 } },
  right: { textAnchor: "start", offset: { x: 4, y: 0 } },
  bottom: { textAnchor: "middle", offset: { x: 0, y: 8 } },
  left: { textAnchor: "end", offset: { x: -4, y: 0 } },
};

interface Props {
  title: string;
  anchorEl: SVGGraphicsElement | null;
  open?: boolean;
  placement?: Placement;
}

/**
 * A popup tooltip inside SVG land
 */
const SvgTooltip: React.FC<Props> = ({
  title,
  anchorEl,
  open = true,
  placement = "top",
}) => {
  const { palette } = useTheme();
  const { svgRef } = useContext(SvgContext);
  const domToSVGPosition = useDOMToSVGPosition();
  const filterId = useId();

  if (!anchorEl || !open) {
    return null;
  }

  const { textAnchor, offset } = placementParams[placement];
  const anchorRect = anchorEl.getBoundingClientRect();
  const anchorCenter = {
    x: (anchorRect.left + anchorRect.right) / 2,
    y: (anchorRect.top + anchorRect.bottom) / 2,
  };
  const position = add(domToSVGPosition(anchorCenter), offset);

  // We need to portal this to the end of the SVG, so it renders on top of all
  // other elements
  return (
    <Portal container={svgRef.current}>
      <Positioned position={position}>
        {/* Generate a filter that adds a background to the text */}
        <defs>
          <filter x="0" y="0" width="1" height="1" id={filterId}>
            <feFlood floodColor={palette.background.paper} result="bg" />
            <feMerge>
              <feMergeNode in="bg" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <text
          filter={`url(#${filterId})`}
          fill={palette.text.primary}
          textAnchor={textAnchor}
          dominantBaseline="text-before-edge"
          fontSize={3}
        >
          {title}
        </text>
      </Positioned>
    </Portal>
  );
};

export default SvgTooltip;
