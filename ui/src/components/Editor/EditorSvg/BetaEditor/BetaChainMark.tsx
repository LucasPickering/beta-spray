import { useRef } from "react";
import { useDrag, useDragLayer } from "components/Editor/util/dnd";
import { Portal, Tooltip } from "@mui/material";
import Positioned from "../common/Positioned";
import BetaMoveIcon from "./BetaMoveIcon";
import { graphql, useFragment } from "react-relay";
import { BetaChainMark_betaMoveNode$key } from "./__generated__/BetaChainMark_betaMoveNode.graphql";
import {
  useBetaMoveColor,
  useBetaMoveVisualPosition,
} from "components/Editor/util/svg";
import { isDefined } from "util/func";
import { useHighlight } from "components/Editor/util/highlight";

interface Props {
  betaMoveKey: BetaChainMark_betaMoveNode$key;
  isInCurrentStance: boolean;
}

/**
 * An icon representing a single beta move in a chain
 */
const BetaChainMark: React.FC<Props> = ({ betaMoveKey, isInCurrentStance }) => {
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

  const [highlightedMoveId, highlightMove] = useHighlight("move");
  const isHighlighted = highlightedMoveId === moveId;
  const highlightThis = (): void => highlightMove(moveId);

  drag(ref);
  return (
    <>
      <Positioned position={position}>
        {isInCurrentStance ? (
          <BetaMoveIcon
            ref={ref}
            bodyPart={betaMove.bodyPart}
            order={betaMove.order}
            isStart={betaMove.isStart}
            isFree={!isDefined(betaMove.hold)}
            color={color}
            draggable
            isDragging={isDragging}
            isHighlighted={isHighlighted}
            // Don't block drop events when another element is being dragged
            css={isDraggingOther && { pointerEvents: "none" }}
            // Hover (desktop) or click (mobile) => highlight the move
            onClick={highlightThis}
            onMouseEnter={highlightThis}
          />
        ) : (
          // Not part of the current stance - show a little icon
          <circle
            r={1.5}
            fill={color}
            onClick={highlightThis}
            onMouseEnter={highlightThis}
          />
        )}
      </Positioned>

      {betaMove.annotation && (
        <Portal>
          <Tooltip
            open={isInCurrentStance}
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
