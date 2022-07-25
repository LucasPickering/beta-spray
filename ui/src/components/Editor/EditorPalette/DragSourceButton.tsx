import { IconButton, IconButtonProps, Tooltip } from "@mui/material";
import React from "react";
import { DragKind, DragSpec, useDrag } from "util/dnd";

interface Props<K extends DragKind> extends IconButtonProps {
  dragSpec: DragSpec<K>;
  title: string;
  children: React.ReactNode;
}

/**
 * A button in the palette, which the user can drag out to add an item to the
 * editor.
 */
function DragSourceButton<K extends DragKind>({
  dragSpec,
  title,
  children,
  ...rest
}: Props<K>): React.ReactElement {
  const [, drag] = useDrag(dragSpec);

  return (
    <Tooltip title={title} placement="right">
      <IconButton ref={drag} component="span" sx={{ cursor: "grab" }} {...rest}>
        {children}
      </IconButton>
    </Tooltip>
  );
}

export default DragSourceButton;
