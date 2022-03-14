import React from "react";
import { DragItemWithKind } from "util/dnd";
import BetaMoveListItem from "../EditorControls/BetaMoveListItem";
import BetaMoveIcon from "./BetaEditor/BetaMoveIcon";
import HoldIcon from "./HoldEditor/HoldIcon";

interface Props {
  mode: "svg" | "html";
  itemWithKind: DragItemWithKind;
}

const DragPreview: React.FC<Props> = ({ mode, itemWithKind }) => {
  if (mode === "html") {
    switch (itemWithKind.kind) {
      case "betaMoveList":
        return (
          <BetaMoveListItem
            bodyPart={itemWithKind.item.bodyPart}
            order={itemWithKind.item.order}
          />
        );
    }
  }

  if (mode === "svg") {
    switch (itemWithKind.kind) {
      case "holdOverlay":
        return <HoldIcon isDragging />;
      case "betaMoveOverlay": {
        const { item } = itemWithKind;
        const move = item.kind === "move" ? item.move : item.startMove;
        // TODO include projected `order` on the preview
        return <BetaMoveIcon bodyPart={move.bodyPart} isDragging />;
      }
    }
  }

  // Indicates a mode mismatch, which is common since both modes are always
  // being rendered.
  return null;
};

export default DragPreview;
