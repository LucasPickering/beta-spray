import {
  APIPosition,
  OverlayPosition,
} from "components/Editor/EditorOverlay/types";
import OverlayContext from "context/OverlayContext";
import { useContext, useMemo } from "react";
import { assertIsDefined } from "./func";

export function useOverlayUtils(): {
  toOverlayPosition: (apiPosition: APIPosition) => OverlayPosition;
  toAPIPosition: (overlayPosition: OverlayPosition) => APIPosition;
  getMouseCoords: (event: React.MouseEvent) => OverlayPosition;
} {
  const { aspectRatio, svgRef } = useContext(OverlayContext);
  return useMemo(
    () => ({
      toOverlayPosition(apiPosition) {
        return {
          x: apiPosition.positionX * 100,
          y: (apiPosition.positionY * 100) / aspectRatio,
        };
      },
      toAPIPosition(overlayPosition) {
        return {
          positionX: overlayPosition.x / 100,
          positionY: (overlayPosition.y / 100) * aspectRatio,
        };
      },
      getMouseCoords(event) {
        // Map DOM coords to SVG coords
        // https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
        const svg = svgRef.current;
        assertIsDefined(svg);

        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;

        const ctm = svg.getScreenCTM();
        assertIsDefined(ctm);
        const svgPoint = point.matrixTransform(ctm.inverse());

        return { x: svgPoint.x, y: svgPoint.y };
      },
    }),
    [aspectRatio, svgRef]
  );
}
