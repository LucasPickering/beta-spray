import {
  APIPosition,
  OverlayPosition,
} from "components/Editor/EditorSvg/types";
import { useContext, useMemo } from "react";
import { XYCoord } from "react-dnd";
import { SvgContext } from "./context";
import { assertIsDefined } from "./func";

/**
 * Helpful utility functions for working with overlay positions. This is a hook
 * because some operations require context about the SVG's dimensions in order
 * to do calculations.
 */
function useOverlayUtils(): {
  toOverlayPosition(apiPosition: APIPosition): OverlayPosition;
  toAPIPosition(overlayPosition: OverlayPosition): APIPosition;
  toSvgPosition(domPosition: XYCoord): OverlayPosition;
} {
  const { svgRef, dimensions } = useContext(SvgContext);
  return useMemo(
    () => ({
      toOverlayPosition(apiPosition) {
        return {
          x: apiPosition.positionX * dimensions.width,
          y: apiPosition.positionY * dimensions.height,
        };
      },
      toAPIPosition(overlayPosition) {
        return {
          positionX: overlayPosition.x / dimensions.width,
          positionY: overlayPosition.y / dimensions.height,
        };
      },
      toSvgPosition(domPosition) {
        // Map DOM coords to SVG
        // https://www.sitepoint.com/how-to-translate-from-dom-to-svg-coordinates-and-back-again/
        const svg = svgRef.current;
        assertIsDefined(svg); // Ref is only null on first render

        const point = svg.createSVGPoint();
        point.x = domPosition.x;
        point.y = domPosition.y;

        const ctm = svg.getScreenCTM();
        assertIsDefined(ctm);
        return point.matrixTransform(ctm.inverse());
      },
    }),
    [dimensions.width, dimensions.height, svgRef]
  );
}

export default useOverlayUtils;
