import { IconButton } from "@mui/material";
import React from "react";
import { DragKind, DragSpec, useDrag } from "util/dnd";

interface Props<K extends DragKind> {
  dragSpec: DragSpec<K>;
  children: React.ReactNode;
}

function EditorPaletteButton<K extends DragKind>({
  dragSpec,
  children,
}: Props<K>): React.ReactElement {
  const [, drag] = useDrag(dragSpec);

  return <IconButton ref={drag}>{children}</IconButton>;
}

export default EditorPaletteButton;
