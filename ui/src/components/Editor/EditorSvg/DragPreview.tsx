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
            // Hacky translation: DnD uses the drag handle as the component
            // root, so the parent offset will align to that. We want to align
            // to the list item though (the parent of the drag handle), so we
            // need to apply a static offset to adjust. There's no way to attach
            // DnD to the list item itself, so this is the next best option.
            sx={{ transform: "translate(-16px, -12px)" }}
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
