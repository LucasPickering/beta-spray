import { useTheme } from "@mui/material";
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
  const theme = useTheme();

  if (mode === "html") {
    switch (itemWithKind.kind) {
      case "betaMoveList":
        return (
          <BetaMoveListItem
            bodyPart={itemWithKind.item.bodyPart}
            order={itemWithKind.item.order}
            isStart={itemWithKind.item.isStart}
            totalMoves={itemWithKind.item.totalMoves}
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
    }
  }

  // Indicates a mode mismatch, which is common since both modes are always
  // being rendered.
  return null;
};

export default DragPreview;
