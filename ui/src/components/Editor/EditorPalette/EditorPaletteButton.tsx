import { IconButton, IconButtonProps } from "@mui/material";
import React from "react";
import { DragKind, DragSpec, useDrag } from "util/dnd";

interface Props<K extends DragKind> extends IconButtonProps {
  dragSpec: DragSpec<K>;
  children: React.ReactNode;
}

/**
 * TODO
 */
function EditorPaletteButton<K extends DragKind>({
  dragSpec,
  children,
  ...rest
}: Props<K>): React.ReactElement {
  const [, drag] = useDrag(dragSpec);

  // TODO accessibility and better css
  return (
    <IconButton ref={drag} {...rest}>
      {children}
    </IconButton>
  );
}

export default EditorPaletteButton;
