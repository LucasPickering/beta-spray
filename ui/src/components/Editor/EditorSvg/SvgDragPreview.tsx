import { useTheme } from "@mui/material";
import React from "react";
import { DragItemWithKind } from "util/dnd";
import BetaMoveIcon from "./BetaEditor/BetaMoveIcon";
import HoldIcon from "./HoldEditor/HoldIcon";

interface Props {
  itemWithKind: DragItemWithKind;
}

const SvgDragPreview: React.FC<Props> = ({ itemWithKind }) => {
  const theme = useTheme();

  switch (itemWithKind.kind) {
    case "holdOverlay":
      return <HoldIcon draggable isDragging />;
    case "betaMoveOverlay": {
      const { item } = itemWithKind;
      // We don't know what order the new move will be, so don't show text
      // and kinda "guess" at the color. We know for sure it's not a start
      // move though, since you can only add subsequent moves.
      return (
        <BetaMoveIcon
          bodyPart={item.bodyPart}
          // Just pick a pretty color, basically
          primaryColor={theme.palette.primary.main}
          isDragging
        />
      );
    }
    default:
      // All other drag types should be handled by other preview layers
      return null;
  }
};

export default SvgDragPreview;
