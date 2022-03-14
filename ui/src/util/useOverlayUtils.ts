import {
  APIPosition,
  OverlayPosition,
} from "components/Editor/EditorOverlay/types";
import OverlayContext from "context/OverlayContext";
import { useContext, useMemo } from "react";
import { XYCoord } from "react-dnd";
import { assertIsDefined } from "./func";

export function useOverlayUtils(): {
  toOverlayPosition: (apiPosition: APIPosition) => OverlayPosition;
  toAPIPosition: (overlayPosition: OverlayPosition) => APIPosition;
  toSvgPosition: (domPosition: XYCoord) => OverlayPosition;
} {
  const { viewBoxWidth, viewBoxHeight, svgRef } = useContext(OverlayContext);
  return useMemo(
    () => ({
      toOverlayPosition(apiPosition) {
        return {
          x: apiPosition.positionX * viewBoxWidth,
          y: apiPosition.positionY * viewBoxHeight,
        };
      },
      toAPIPosition(overlayPosition) {
        return {
          positionX: overlayPosition.x / viewBoxWidth,
          positionY: overlayPosition.y / viewBoxHeight,
        };
      },
      toSvgPosition(domPosition) {
        // Map DOM coords to SVG coords
        // https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
        const svg = svgRef.current;
        assertIsDefined(svg);

        const point = svg.createSVGPoint();
        point.x = domPosition.x;
        point.y = domPosition.y;

        const ctm = svg.getScreenCTM();
        assertIsDefined(ctm);
        const svgPoint = point.matrixTransform(ctm.inverse());

        return { x: svgPoint.x, y: svgPoint.y };
      },
    }),
    [viewBoxWidth, viewBoxHeight, svgRef]
  );
}
