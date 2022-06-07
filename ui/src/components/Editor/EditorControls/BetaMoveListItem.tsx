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
import { formatBodyPart, useBetaMoveColors } from "util/svg";
import { isDefined } from "util/func";
import { graphql, useFragment } from "react-relay";
import { BetaMoveListItem_betaMoveNode$key } from "./__generated__/BetaMoveListItem_betaMoveNode.graphql";

interface Props extends React.ComponentProps<typeof ListItem> {
  betaMoveKey: BetaMoveListItem_betaMoveNode$key;
  disabled?: boolean;
  onDelete?: () => void;
}

/**
 * A dumb component to render a beta move in a list.
 */
const BetaMoveListItem = React.forwardRef<SVGSVGElement, Props>(
  ({ betaMoveKey, disabled = false, onDelete, ...rest }, ref) => {
    const betaMove = useFragment(
      graphql`
        fragment BetaMoveListItem_betaMoveNode on BetaMoveNode {
          id
          bodyPart
          order
        }
      `,
      betaMoveKey
    );

    const colors = useBetaMoveColors()(betaMove.id);
    return (
      <ListItem disabled={disabled} {...rest}>
        <ListItemIcon>
          {/* Ref is used for dnd only, so pass it to the drag handle.
              This prevents interfering with scrolling on mobile */}
          <IconDragHandle ref={ref} sx={[!disabled && { cursor: "move" }]} />
        </ListItemIcon>

        <ListItemText
          sx={[
            { color: colors.primary },
            // Show stroke color as an underline. This is a little ugly but it
            // works for now at least (ecks dee)
            isDefined(colors.secondary) && {
              textDecoration: "underline",
              textDecorationColor: colors.secondary,
            },
          ]}
        >
          {betaMove.order} {formatBodyPart(betaMove.bodyPart)}
        </ListItemText>

        {/* Preview version of the element shouldn't show this button. Note: this
            actually impacts the DOM layout! When this element isn't present, MUI
            leaves out an extra container component, which fixes some other
            styling issues. */}
        {onDelete && (
          <ListItemSecondaryAction>
            <IconButton
              aria-label={`delete move ${betaMove.order}`}
              size="small"
              disabled={disabled}
              onClick={onDelete}
            >
              <IconClose />
            </IconButton>
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );
  }
);

BetaMoveListItem.displayName = "BetaMoveListItem";

export default BetaMoveListItem;
