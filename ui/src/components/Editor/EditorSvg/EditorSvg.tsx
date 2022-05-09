import React, { useContext, useRef } from "react";
import { EditorContext, SvgContext } from "util/context";
import { zoomMaximum, zoomMinimum, zoomStep } from "./consts";
import { coerce } from "util/math";
import { graphql, useFragment } from "react-relay";
import { EditorSvg_boulderNode$key } from "./__generated__/EditorSvg_boulderNode.graphql";
import { useTheme } from "@mui/material";
import { XYCoord } from "react-dnd";
import { useOverlayUtils } from "util/useOverlayUtils";

interface Props {
  boulderKey: EditorSvg_boulderNode$key;
}

/**
 * Main component of the editor. Render the boulder image as well as all overlay
 * components on top. This is just a wrapper, children are passed in by the
 * parent so that props can be drilled more easily.
 */
const EditorSvg: React.FC<Props> = ({ boulderKey, children }) => {
  const boulder = useFragment(
    graphql`
      fragment EditorSvg_boulderNode on BoulderNode {
        image {
          width
          height
        }
      }
    `,
    boulderKey
  );
  const ref = useRef<SVGSVGElement | null>(null);

  // Make sure 100 is always the *smaller* of the two dimensions, so we get
  // consistent sizing on SVG elements for landscape vs portrait
  const aspectRatio = boulder.image.width / boulder.image.height;
  const dimensions =
    aspectRatio < 1
      ? { width: 100, height: 100 / aspectRatio }
      : { width: 100 * aspectRatio, height: 100 };

  return (
    <SvgContext.Provider value={{ svgRef: ref, dimensions }}>
      <EditorSvgInner ref={ref}>{children}</EditorSvgInner>
    </SvgContext.Provider>
  );
};

/**
 * Internal helper component. This is separate so we can use useOverlayUtils
 * to get access to some helper functions that depend on SvgContext.
 */
const EditorSvgInner = React.forwardRef<
  SVGSVGElement,
  // I *think* this typing is ok since we're intersecting it with an interface
  // eslint-disable-next-line @typescript-eslint/ban-types
  React.PropsWithChildren<{}>
>(({ children }, ref) => {
  const { palette } = useTheme();
  const { zoomOffset, setZoomOffset } = useContext(EditorContext);
  const { dimensions } = useContext(SvgContext);
  const { toSvgPosition } = useOverlayUtils();

  /**
   * Update zoom and offset when the user scrolls/pinches in and out. Focus
   * point defines which point inside the view box will not move while zooming.
   */
  const updateZoom = (focus: XYCoord, zoomDelta: number): void => {
    // Map the focus coordinates (either cursor or pinch origin) from DOM to
    // SVG coordinates. We'll use that to figure out the new offset.
    const mousePos = toSvgPosition(focus);

    setZoomOffset((prev) => {
      const zoom = coerce(prev.zoom + zoomDelta, zoomMinimum, zoomMaximum);
      // Adjust offset so that the zoom is focused on the cursor, i.e. the
      // cursor remains on the same pixel and the rest of the image
      // scales/shifts around that. The math is a little opaque, but the
      // gist is that the distance from the top-left to the cursor stays
      // the same, as a proportion of the overall width. So we scale that
      // delta from the prev zoom level to the new one.
      //
      // Apply bounds so we don't end up shoving the SVG off screen more than
      // necessary. The upper bound is the difference between SVG width and
      // view box width (calculated using the *new* zoom value). I.e. the
      // distance between the right/bottom of the view box and the right/bottom
      // of the image.
      const offset = {
        x: coerce(
          mousePos.x - (prev.zoom * (mousePos.x - prev.offset.x)) / zoom,
          0,
          dimensions.width - dimensions.width / zoom
        ),
        y: coerce(
          mousePos.y - (prev.zoom * (mousePos.y - prev.offset.y)) / zoom,
          0,
          dimensions.height - dimensions.height / zoom
        ),
      };
      return { zoom, offset };
    });
  };

  // SVG view box, which defines the visible window into the SVG. This is how
  // we implement both pan and zoom, by translating and scaling the view box.
  const viewBox = {
    x: zoomOffset.offset.x,
    y: zoomOffset.offset.y,
    width: dimensions.width / zoomOffset.zoom,
    height: dimensions.height / zoomOffset.zoom,
  };

  return (
    <svg
      ref={ref}
      // Define bounds of the SVG coordinate system
      width={dimensions.width}
      height={dimensions.height}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      // HTML element should fill all available space
      css={{
        width: "100%",
        height: "100%",
        alignSelf: "center",
        backgroundColor: palette.background.paper,
      }}
      // Zoom in/out on scroll
      // TODO capture pinch too
      onWheel={(e) =>
        updateZoom({ x: e.clientX, y: e.clientY }, zoomStep * e.deltaY * -1)
      }
    >
      {children}
    </svg>
  );
});

EditorSvgInner.displayName = "EditorSvgInner";

export default EditorSvg;
