import clsx from "clsx";
import React, { useContext } from "react";
import { BetaOverlayMove, formatOrder } from "../types";
import Circle from "../Circle";
import { DropHandler, useDrag } from "util/dnd";
import commonClasses from "../common.scss";
import { useTheme } from "@chakra-ui/react";
import EditorContext from "context/EditorContext";

interface Props {
  className?: string;
  move: BetaOverlayMove;
  isLast: boolean;
  onDrop?: DropHandler<"betaMoveSvg">;
  onDoubleClick?: (move: BetaOverlayMove) => void;
  onMouseEnter?: (move: BetaOverlayMove) => void;
  onMouseLeave?: (move: BetaOverlayMove) => void;
}

/**
 * A circle representing a single beta move in a chain
 */
const BetaChainCircle: React.FC<Props> = ({
  className,
  move,
  isLast,
  onDrop,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const theme = useTheme();
  const [{ isDragging }, drag] = useDrag<
    "betaMoveSvg",
    { isDragging: boolean }
  >({
    type: "betaMoveSvg",
    item: { kind: "move", move, isLast },
    collect: (monitor) => ({
      isDragging: Boolean(monitor.isDragging()),
    }),
    end: (item, monitor) => {
      const result = monitor.getDropResult();
      if (result && onDrop) {
        onDrop(item, result);
      }
    },
  });
  const { highlightedMove } = useContext(EditorContext);
  const isHighlighted = highlightedMove === move.id;

  return (
    <Circle
      ref={drag}
      // The last move in the chain gets styled differently
      className={clsx(
        commonClasses.draggable,
        isDragging && commonClasses.dragging,
        className
      )}
      // TODO hover styles for responsiveness
      fill={isHighlighted ? "white" : theme.colors[move.bodyPart]}
      position={move.position}
      innerLabel={formatOrder(move.order)}
      onDoubleClick={onDoubleClick && (() => onDoubleClick(move))}
      onMouseEnter={onMouseEnter && (() => onMouseEnter(move))}
      onMouseLeave={onMouseLeave && (() => onMouseLeave(move))}
    />
  );
};

BetaChainCircle.defaultProps = {} as Partial<Props>;

export default BetaChainCircle;
