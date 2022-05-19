import React, { useContext, useState } from "react";
import { XYCoord } from "react-dnd";
import { SvgContext } from "./context";
import { noop } from "./func";
import { coerce } from "./math";
import { add, OverlayPosition, useOverlayUtils } from "./svg";

/** Minimum editor zoom level */
const zoomMinimum = 1.0;

/** Maximum editor zoom level */
const zoomMaximum = 10.0;

/** Step between editor zoom levels, when scrolling/pinching */
const zoomStep = 0.01;

/**
 * Distance beyond the image that user can pan (to get around overlay obstructions)
 * */
const panBufferSpace = 2;

interface ZoomOffset {
  zoom: number;
  offset: OverlayPosition;
}

interface ZoomPanContextType {
  zoomOffset: ZoomOffset;
  setZoomOffset: React.Dispatch<React.SetStateAction<ZoomOffset>>;
}

/**
 * This is deliberately *not* exported, so that only the internal hook here can
 * directly consume the context. All external interactions should be done
 * through the hook.
 */
const ZoomPanContext = React.createContext<ZoomPanContextType>({
  zoomOffset: {
    zoom: 0,
    offset: { x: 0, y: 0 },
  },
  setZoomOffset: noop,
});

interface Props {
  children?: React.ReactNode;
}

/**
 * Context provider for zooming/panning the SVG.
 */
export const ZoomPanProvider: React.FC<Props> = ({ children }) => {
  const [zoomOffset, setZoomOffset] = useState<ZoomOffset>({
    zoom: 1,
    offset: { x: 0, y: 0 },
  });

  return (
    <ZoomPanContext.Provider value={{ zoomOffset, setZoomOffset }}>
      {children}
    </ZoomPanContext.Provider>
  );
};

/**
 * Hook to provide ineractivity with zoom level and panning offset. This hook
 * is the only way to access or modify those two values.
 */
export function useZoomPan(): {
  zoom: number;
  offset: OverlayPosition;
  updateZoom(zoomDelta: number, focusPosition: XYCoord): void;
  updatePan(offset: OverlayPosition): void;
} {
  const { dimensions } = useContext(SvgContext);
  const { zoomOffset, setZoomOffset } = useContext(ZoomPanContext);
  const { toSvgPosition } = useOverlayUtils();

  const coerceZoom = (zoom: number): number =>
    coerce(zoom, zoomMinimum, zoomMaximum);

  /**
   *  Apply bounds so we don't end up shoving the SVG off screen more than
   * necessary. The upper bound is the difference between SVG width and
   * view box width (calculated using the *new* zoom value). I.e. the
   * distance between the right/bottom of the view box and the right/bottom
   * of the image.
   */
  const coerceOffset = (
    offset: OverlayPosition,
    zoom: number
  ): OverlayPosition => ({
    x: coerce(
      offset.x,
      -panBufferSpace,
      dimensions.width - dimensions.width / zoom + panBufferSpace
    ),
    y: coerce(
      offset.y,
      -panBufferSpace,
      dimensions.height - dimensions.height / zoom + panBufferSpace
    ),
  });

  return {
    ...zoomOffset,
    /**
     * Adjust zoom level. The zoom change will be focused on a single point,
     * so that that position in the SVG remains at the same screen position,
     * and everything else scales around it.
     * @param zoomDelta Change in zoom level
     * @param focusPosition Point on the SVG that will remain stationary during
     *  zoom. Typically the cursor position or center of the pinch gesture.
     */
    updateZoom(zoomDelta, focusPosition) {
      // Map the focus coordinates (either cursor or pinch origin) from DOM to
      // SVG coordinates. We'll use that to figure out the new offset.
      const mousePos = toSvgPosition(focusPosition);

      setZoomOffset((prev) => {
        const zoom = coerceZoom(prev.zoom + zoomDelta * zoomStep);
        // Adjust offset so that the zoom is focused on the cursor, i.e. the
        // cursor remains on the same pixel and the rest of the image
        // scales/shifts around that. The math is a little opaque, but the
        // gist is that the distance from the top-left to the cursor stays
        // the same, as a proportion of the overall width. So we scale that
        // delta from the prev zoom level to the new one.
        //
        const offset = coerceOffset(
          {
            x: mousePos.x - (prev.zoom * (mousePos.x - prev.offset.x)) / zoom,
            y: mousePos.y - (prev.zoom * (mousePos.y - prev.offset.y)) / zoom,
          },
          zoom
        );
        return { zoom, offset };
      });
    },
    /**
     * Adjust pan position.
     * @param offsetDelta Change in panning offset
     */
    updatePan(offsetDelta) {
      setZoomOffset((prev) => ({
        zoom: prev.zoom,
        offset: coerceOffset(add(prev.offset, offsetDelta), prev.zoom),
      }));
    },
  };
}
