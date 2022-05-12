import React, { useContext, useRef } from "react";
import { SvgContext } from "util/context";
import { graphql, useFragment } from "react-relay";
import { EditorSvg_boulderNode$key } from "./__generated__/EditorSvg_boulderNode.graphql";
import { useTheme } from "@mui/material";
import { useZoomPan } from "util/zoom";
import { usePinch } from "@use-gesture/react";
import { isDefined } from "util/func";

interface Props {
  boulderKey: EditorSvg_boulderNode$key;
  children?: React.ReactNode;
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
  const { zoom, offset, updateZoom } = useZoomPan();
  const { dimensions } = useContext(SvgContext);

  // Capture pinch gesture for zoom on mobile
  const bind = usePinch((state) => {
    const {
      origin: [originX, originY],
      da: [distance],
      memo,
    } = state;

    // Calculate *difference between* the *distance between the fingers* on this
    // render compared to the previous render. prevDistance should only be
    // undefined on the first render of a gesture.
    const prevDistance = memo?.distance as number | undefined;
    if (isDefined(prevDistance)) {
      const zoomDelta = distance - prevDistance;
      updateZoom(zoomDelta, { x: originX, y: originY });
    }

    return { distance }; // Memoize this for the next loop
  });

  // SVG view box, which defines the visible window into the SVG. This is how
  // we implement both pan and zoom, by translating and scaling the view box.
  const viewBox = {
    x: offset.x,
    y: offset.y,
    width: dimensions.width / zoom,
    height: dimensions.height / zoom,
  };

  return (
    <svg
      ref={ref}
      {...bind()}
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
        touchAction: "none",
      }}
      // Zoom in/out on scroll
      onWheel={(e) => updateZoom(e.deltaY * -1, { x: e.clientX, y: e.clientY })}
    >
      {children}
    </svg>
  );
});

EditorSvgInner.displayName = "EditorSvgInner";

export default EditorSvg;
