import React, { useContext, useRef } from "react";
import {
  EditorModeContext,
  EditorVisibilityContext,
  SvgContext,
} from "components/Editor/util/context";
import { graphql, PreloadedQuery, useFragment } from "react-relay";
import { useZoomPan } from "components/Editor/util/zoom";
import { queriesProblemQuery } from "util/__generated__/queriesProblemQuery.graphql";
import NotFound from "components/common/NotFound";
import BetaEditor from "./BetaEditor/BetaEditor";
import BoulderImage from "./BoulderImage";
import SvgDragLayer from "./SvgDragLayer";
import HoldEditor from "./HoldEditor/HoldEditor";
import { EditorSvg_problemNode$key } from "./__generated__/EditorSvg_problemNode.graphql";
import { usePinch } from "@use-gesture/react";
import { isDefined } from "util/func";
import { problemQuery } from "../../../util/queries";
import { withQuery } from "relay-query-wrapper";
import Loading from "components/common/Loading";
import { queriesBetaQuery } from "util/__generated__/queriesBetaQuery.graphql";
import ErrorBoundary from "components/common/ErrorBoundary";

interface Props {
  problemKey: EditorSvg_problemNode$key;
  betaQueryRef: PreloadedQuery<queriesBetaQuery> | null | undefined;
}

/**
 * Main component of the editor. Render the boulder image as well as all overlay
 * components on top.
 */
const EditorSvg: React.FC<Props> = ({ problemKey, betaQueryRef }) => {
  const problem = useFragment(
    graphql`
      fragment EditorSvg_problemNode on ProblemNode {
        name
        boulder {
          image {
            svgWidth
            svgHeight
          }
          ...BoulderImage_boulderNode
        }
        ...HoldEditor_problemNode
      }
    `,
    problemKey
  );

  const ref = useRef<SVGSVGElement | null>(null);
  const [visibility] = useContext(EditorVisibilityContext);
  const [editorMode] = useContext(EditorModeContext);

  const dimensions = {
    width: problem.boulder.image.svgWidth,
    height: problem.boulder.image.svgHeight,
  };

  return (
    <ErrorBoundary>
      <SvgContext.Provider value={{ svgRef: ref, dimensions }}>
        <EditorSvgInner ref={ref}>
          <BoulderImage boulderKey={problem.boulder} />

          {/* This has to go before other interactive stuff so it doesn't eat
            events from other components */}
          <SvgDragLayer />

          {visibility && (
            <>
              <HoldEditor problemKey={problem} />
              {/* Don't render beta when editing holds */}
              {editorMode !== "editHolds" && (
                <BetaEditor queryRef={betaQueryRef} />
              )}
            </>
          )}
        </EditorSvgInner>
      </SvgContext.Provider>
    </ErrorBoundary>
  );
};

/**
 * Internal helper component. This is separate so we can use useDomToSvgPosition
 * to get access to some helper functions that depend on SvgContext.
 */
const EditorSvgInner = React.forwardRef<
  SVGSVGElement,
  // I *think* this typing is ok since we're intersecting it with an interface
  // eslint-disable-next-line @typescript-eslint/ban-types
  React.PropsWithChildren<{}>
>(({ children }, ref) => {
  const { zoom, offset, updateZoom } = useZoomPan();
  const { dimensions } = useContext(SvgContext);

  // Capture pinch gesture for zoom on mobile
  const bind = usePinch(
    ({ origin: [originX, originY], da: [distance], memo }) => {
      // Calculate *difference between* the *distance between the fingers* on this
      // render compared to the previous render. prevDistance should only be
      // undefined on the first render of a gesture.
      const prevDistance = memo?.distance as number | undefined;
      if (isDefined(prevDistance)) {
        const zoomDelta = distance - prevDistance;
        updateZoom(zoomDelta, { x: originX, y: originY });
      }

      return { distance }; // Memoize this for the next loop
    }
  );

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
        touchAction: "none",
      }}
      // Zoom in/out on scroll
      onWheel={(e) => updateZoom(-e.deltaY, { x: e.clientX, y: e.clientY })}
    >
      {children}
    </svg>
  );
});

EditorSvgInner.displayName = "EditorSvgInner";

export default withQuery<queriesProblemQuery, Props, "problemKey">({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: <Loading size={100} />,
  noDataElement: <NotFound />,
})(EditorSvg);
