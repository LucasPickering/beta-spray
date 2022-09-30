import React, { useContext, useRef } from "react";
import { useDrag, useDragLayer } from "util/dnd";
import { Portal, Tooltip } from "@mui/material";
import {
  EditorHighlightedMoveContext,
  EditorSelectedMoveContext,
} from "util/context";
import Positioned from "../Positioned";
import BetaMoveIcon from "./BetaMoveIcon";
import { graphql, useFragment } from "react-relay";
import { BetaChainMark_betaMoveNode$key } from "./__generated__/BetaChainMark_betaMoveNode.graphql";
import { useBetaMoveColor, useBetaMoveVisualPosition } from "util/svg";
import { isDefined } from "util/func";

interface Props {
  betaMoveKey: BetaChainMark_betaMoveNode$key;
}

/**
 * An icon representing a single beta move in a chain
 */
const BetaChainMark: React.FC<Props> = ({ betaMoveKey }) => {
  const betaMove = useFragment(
    graphql`
      fragment BetaChainMark_betaMoveNode on BetaMoveNode {
        id
        bodyPart
        order
        hold {
          id
        }
        isStart
        isLastInChain
        annotation
        beta {
          id
        }
      }
    `,
    betaMoveKey
  );
  const moveId = betaMove.id; // This gets captured by a lot of lambdas
  const color = useBetaMoveColor()(moveId);
  const position = useBetaMoveVisualPosition()(moveId);

  const ref = useRef<SVGCircleElement>(null);

  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: {
      action: "relocate",
      betaMoveId: moveId,
      bodyPart: betaMove.bodyPart,
    },
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
  });

  // Check if we're dragging *anything*. We'll mask this with isDragging from
  // above to check if we're dragging anything *else*. If so, we'll disable
  // pointer events for this element. This will prevent us from blocking drop
  // events on the underlying hold.
  const { isDraggingAny } = useDragLayer((monitor) => ({
    isDraggingAny: monitor.isDragging(),
  }));
  const isDraggingOther = isDraggingAny && !isDragging;

  const [highlightedMove, setHighlightedMove] = useContext(
    EditorHighlightedMoveContext
  );
  const [, setSelectedMove] = useContext(EditorSelectedMoveContext);
  const isHighlighted = highlightedMove === moveId;

  drag(ref);
  return (
    <>
      <Positioned position={position}>
        <BetaMoveIcon
          ref={ref}
          bodyPart={betaMove.bodyPart}
          order={betaMove.order}
          isStart={betaMove.isStart}
          isFree={!isDefined(betaMove.hold)}
          hasAnnotation={Boolean(betaMove.annotation)}
          color={color}
          draggable
          isDragging={isDragging}
          isHighlighted={isHighlighted}
          // Don't block drop events when another element is being dragged
          css={isDraggingOther && { pointerEvents: "none" }}
          // Click => toggle highlight on move
          onClick={() =>
            // If we already "own" the selection, then toggle off
            setHighlightedMove((old) => (old === moveId ? undefined : moveId))
          }
          // Double click => delete move
          onDoubleClick={() => setSelectedMove(moveId)}
          // Hover => highlight move
          onMouseEnter={() => setHighlightedMove(moveId)}
          onMouseLeave={() => setHighlightedMove(undefined)}
        />
      </Positioned>

      {betaMove.annotation && (
        <Portal>
          <Tooltip
            open={isHighlighted}
            title={betaMove.annotation}
            placement="bottom"
            PopperProps={{ anchorEl: ref.current }}
          >
            <span />
          </Tooltip>
        </Portal>
      )}
    </>
  );
};

export default BetaChainMark;
