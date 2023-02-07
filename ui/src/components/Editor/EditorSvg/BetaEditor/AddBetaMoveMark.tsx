import { useTheme } from "@mui/material";
import { DragFinishHandler, useDrag } from "components/Editor/util/dnd";
import React from "react";
import { graphql, useFragment } from "react-relay";
import { styleDraggable, styleDragging } from "styles/svg";
import { isDefined } from "util/func";
import { AddBetaMoveMark_betaMoveNode$key } from "./__generated__/AddBetaMoveMark_betaMoveNode.graphql";

interface Props {
  betaMoveKey: AddBetaMoveMark_betaMoveNode$key;
  onDragFinish?: DragFinishHandler<"overlayBetaMove">;
}

/**
 * A drag handle to add a new beta move. This should be associated with a
 * particular move.
 */
const AddBetaMoveMark: React.FC<Props> = ({ betaMoveKey, onDragFinish }) => {
  const betaMove = useFragment(
    graphql`
      fragment AddBetaMoveMark_betaMoveNode on BetaMoveNode {
        id
        bodyPart
        isLastInChain
      }
    `,
    betaMoveKey
  );

  const [{ isDragging }, drag] = useDrag<
    "overlayBetaMove",
    { isDragging: boolean }
  >({
    type: "overlayBetaMove",
    item: betaMove.isLastInChain
      ? {
          action: "create",
          bodyPart: betaMove.bodyPart,
        }
      : {
          action: "insertAfter",
          bodyPart: betaMove.bodyPart,
          betaMoveId: betaMove.id,
        },
    collect(monitor) {
      return {
        isDragging: Boolean(monitor.isDragging()),
      };
    },
    end(draggedItem, monitor) {
      const dropResult = monitor.getDropResult();
      if (onDragFinish && isDefined(dropResult)) {
        onDragFinish(draggedItem, dropResult, monitor);
      }
    },
  });

  return (
    <IconAddBetaMoveRaw
      ref={drag}
      css={[styleDraggable, isDragging && styleDragging]}
    />
  );
};

const IconAddBetaMoveRaw = React.forwardRef<
  SVGGElement,
  React.SVGProps<SVGPathElement>
>((props, ref) => {
  const { palette } = useTheme();
  return (
    <g ref={ref} {...props}>
      <circle r={1.5} fill={palette.success.main} />
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={3}
        fill={palette.getContrastText(palette.success.main)}
      >
        +
      </text>
    </g>
  );
});

IconAddBetaMoveRaw.displayName = "IconAddBetaMoveRaw";

export default AddBetaMoveMark;
