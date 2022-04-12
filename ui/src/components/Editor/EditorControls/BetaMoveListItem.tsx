import React from "react";
import {
  DragHandle as IconDragHandle,
  Close as IconClose,
} from "@mui/icons-material";
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { BodyPart, formatBodyPart, formatOrder } from "../EditorOverlay/types";

interface Props extends React.ComponentProps<typeof ListItem> {
  bodyPart: BodyPart;
  order: number;
  disabled?: boolean;
  onDelete?: () => void;
}

/**
 * A dumb component to render a beta move in a list.
 */
const BetaMoveListItem = React.forwardRef<SVGSVGElement, Props>(
  ({ bodyPart, order, disabled = false, onDelete, ...rest }, ref) => (
    <ListItem disabled={disabled} {...rest}>
      <ListItemIcon>
        {/* Ref is used for dnd only, so pass it to the drag handle.
            This prevents interfering with scrolling on mobile */}
        <IconDragHandle ref={ref} sx={[!disabled && { cursor: "move" }]} />
      </ListItemIcon>

      <ListItemText
        sx={({ palette }) => ({ color: palette.bodyParts[bodyPart] })}
      >
        {formatOrder(order)} {formatBodyPart(bodyPart)}
      </ListItemText>

      {/* Preview version of the element shouldn't show this button. Note: this
          actually impacts the DOM layout! When this element isn't present, MUI
          leaves out an extra container component, which fixes some other
          styling issues. */}
      {onDelete && (
        <ListItemSecondaryAction>
          <IconButton
            aria-label={`delete move ${formatOrder(order)}`}
            size="small"
            disabled={disabled}
            onClick={onDelete}
          >
            <IconClose />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  )
);

BetaMoveListItem.displayName = "BetaMoveListItem";

export default BetaMoveListItem;
