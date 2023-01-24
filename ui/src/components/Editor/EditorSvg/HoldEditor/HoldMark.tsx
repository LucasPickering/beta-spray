import { useRef } from "react";
import { DropHandler, useDrag, useDrop } from "components/Editor/util/dnd";
import { graphql, useFragment } from "react-relay";
import { HoldMark_holdNode$key } from "./__generated__/HoldMark_holdNode.graphql";
import Positioned from "../common/Positioned";
import HoldIcon from "./HoldIcon";
import { useHighlight } from "components/Editor/util/highlight";
import { Portal, Tooltip } from "@mui/material";

interface Props {
  holdKey: HoldMark_holdNode$key;
  draggable?: boolean;
  /**
   * Called when something is dropped *onto* this hold
   */
  onDrop?: DropHandler<"overlayBetaMove", "hold">;
}

/**
 * An editable hold, in the context of the full interface editor.
 */
const HoldMark: React.FC<Props> = ({ holdKey, onDrop }) => {
  const ref = useRef<SVGCircleElement | null>(null);
  const hold = useFragment(
    graphql`
      fragment HoldMark_holdNode on HoldNode {
        id
        position {
          x
          y
        }
        annotation
      }
    `,
    holdKey
  );

  // Drag this hold around, while editing holds
  const [{ isDragging }, drag] = useDrag<
    "overlayHold",
    { isDragging: boolean }
  >({
    type: "overlayHold",
    item: { action: "relocate", holdId: hold.id },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
  });

  // Drop *moves* onto this hold
  const [{ isOver }, drop] = useDrop<"overlayBetaMove", { isOver: boolean }>({
    accept: "overlayBetaMove",
    collect: (monitor) => ({
      isOver: Boolean(monitor.isOver()),
    }),
    // Apply mutation based on exactly what was dropped
    drop(item, monitor) {
      const result = {
        kind: "hold",
        holdId: hold.id,
        position: hold.position,
      } as const;
      if (onDrop) {
        onDrop(item, result, monitor);
      }
      return result;
    },
  });

  const [highlightedHoldId, highlightHold] = useHighlight("hold");
  const isHighlighted = highlightedHoldId === hold.id;
  const highlightThis = (): void => highlightHold(hold.id);

  drag(drop(ref));
  return (
    <>
      <Positioned
        ref={ref}
        position={hold.position}
        onClick={highlightThis}
        onMouseEnter={highlightThis}
      >
        <HoldIcon
          draggable
          isDragging={isDragging}
          isOver={isOver}
          isHighlighted={isHighlighted}
        />
      </Positioned>

      {hold.annotation && (
        <Portal>
          <Tooltip
            open={isHighlighted}
            title={hold.annotation}
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

HoldMark.defaultProps = {} as Partial<Props>;

export default HoldMark;
