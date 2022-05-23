import React, { useContext, useEffect, useRef } from "react";
import { EditorContext, SvgContext } from "util/context";
import { graphql, useFragment } from "react-relay";
import { useZoomPan } from "util/zoom";
import { queriesProblemQuery } from "../__generated__/queriesProblemQuery.graphql";
import NotFound from "components/common/NotFound";
import BetaEditor from "./BetaEditor/BetaEditor";
import BoulderImage from "./BoulderImage";
import DragLayer from "./DragLayer";
import HoldEditor from "./HoldEditor/HoldEditor";
import HoldMarks from "./HoldEditor/HoldMarks";
import PanZone from "./PanZone";
import { EditorSvg_problemNode$key } from "./__generated__/EditorSvg_problemNode.graphql";
import { usePinch } from "@use-gesture/react";
import { isDefined } from "util/func";
import { problemQuery } from "../queries";
import withQuery from "util/withQuery";
import Loading from "components/common/Loading";

interface Props {
  problemKey: EditorSvg_problemNode$key;
}

/**
 * Main component of the editor. Render the boulder image as well as all overlay
 * components on top.
 */
const EditorSvg: React.FC<Props> = ({ problemKey }) => {
  const problem = useFragment(
    graphql`
      fragment EditorSvg_problemNode on ProblemNode {
        name
        boulder {
          image {
            width
            height
          }
          ...BoulderImage_boulderNode
        }
        ...HoldEditor_problemNode
        holds {
          edges {
            cursor
          }
          ...HoldMarks_holdConnection
        }
      }
    `,
    problemKey
  );

  const { betaQueryRef, selectedBeta, mode, setMode, setSelectedHold } =
    useContext(EditorContext);
  const ref = useRef<SVGSVGElement | null>(null);

  // On first load, we'll be editing beta by default. If there are no holds
  // though, edit holds instead since you can't create any beta yet.
  useEffect(() => {
    if (problem.holds.edges.length === 0) {
      setMode("holds");
    }
    // Intentionally ignore all changes, we really really only want to do this
    // on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Make sure 100 is always the *smaller* of the two dimensions, so we get
  // consistent sizing on SVG elements for landscape vs portrait
  const aspectRatio =
    problem.boulder.image.width / problem.boulder.image.height;
  const dimensions =
    aspectRatio < 1
      ? { width: 100, height: 100 / aspectRatio }
      : { width: 100 * aspectRatio, height: 100 };

  return (
    <SvgContext.Provider value={{ svgRef: ref, dimensions }}>
      <EditorSvgInner ref={ref}>
        <BoulderImage boulderKey={problem.boulder} />

        {/* This has to go before other interactive stuff so it doesn't eat
            events from other components */}
        <DragLayer mode="svg" />

        <PanZone />

        {mode === "holds" && <HoldEditor problemKey={problem} />}

        {mode === "beta" && (
          <>
            <HoldMarks
              holdConnectionKey={problem.holds}
              // Selecting a hold opens the move modal, which shouldn't be
              // possible if no beta is selected
              onClick={selectedBeta ? setSelectedHold : undefined}
            />
            <BetaEditor queryRef={betaQueryRef} />
          </>
        )}
      </EditorSvgInner>
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
      onWheel={(e) => updateZoom(e.deltaY * -1, { x: e.clientX, y: e.clientY })}
    >
      {children}
    </svg>
  );
});

EditorSvgInner.displayName = "EditorSvgInner";

export default withQuery<queriesProblemQuery, Props>({
  query: problemQuery,
  dataToProps: (data) => data.problem && { problemKey: data.problem },
  fallbackElement: <Loading size={100} />,
  noDataElement: <NotFound />,
})(EditorSvg);
