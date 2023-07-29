import { isDefined } from "util/func";
import {
  Close as IconClose,
  DragHandle as IconDragHandle,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";
import { formatBodyPart } from "components/Editor/util/svg";
import React from "react";
import { graphql, useFragment } from "react-relay";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import { useBetaMoveColor } from "../util/moves";
import { BetaMoveListItem_betaMoveNode$key } from "./__generated__/BetaMoveListItem_betaMoveNode.graphql";

interface Props extends Omit<React.ComponentProps<typeof ListItem>, "onClick"> {
  betaMoveKey: BetaMoveListItem_betaMoveNode$key;
  stanceColor?: string;
  draggable?: boolean;
  isDragging?: boolean;
  dragRef?: React.Ref<SVGSVGElement>;
  onClick?: (betaMoveId: string) => void;
  onDelete?: () => void;
}

/**
 * A dumb component to render a beta move in a list.
 */
const BetaMoveListItem = React.forwardRef<HTMLLIElement, Props>(
  (
    {
      betaMoveKey,
      stanceColor,
      draggable = true,
      isDragging = false,
      dragRef,
      onClick,
      onDelete,
      ...rest
    },
    ref
  ) => {
    const betaMove = useFragment(
      graphql`
        fragment BetaMoveListItem_betaMoveNode on BetaMoveNode {
          id
          bodyPart
          order
          annotation
          isStart
          isFree @required(action: THROW)
        }
      `,
      betaMoveKey
    );

    const color = useBetaMoveColor()(betaMove.id);
    return (
      <ListItem
        ref={ref}
        // Hide action for preview version
        secondaryAction={
          onDelete && (
            <IconButton
              aria-label={`delete move ${betaMove.order}`}
              size="small"
              onClick={onDelete}
            >
              <IconClose />
            </IconButton>
          )
        }
        sx={[
          {
            userSelect: "none",
            // Normally this is inherit from the <ol>, but that isn't present
            // for the preview version, so let's be a homie and fix it here
            listStyle: "none",
          },
          // Use opacity to hide the original move while dragging, because we
          // want the element to remain in the doc flow and keep producing events
          isDragging && { opacity: 0 },
          // If we're in the current stance, add a little indicator line
          isDefined(stanceColor) &&
            (({ palette }) => ({
              backgroundColor: alpha(
                stanceColor,
                palette.action.activatedOpacity
              ),
            })),
        ]}
        disablePadding
        onClick={() => onClick?.(betaMove.id)}
        {...rest}
      >
        <ListItemButton>
          <ListItemIcon>
            {/* Only use the drag icon for dragging, to prevent interfering with
              scrolling on mobile */}
            {draggable && (
              <IconDragHandle
                ref={dragRef}
                sx={{ paddingRight: 1, cursor: "grab" }}
              />
            )}
            <BetaMoveIconWrapped
              bodyPart={betaMove.bodyPart}
              order={betaMove.order}
              color={color}
              isStart={betaMove.isStart}
              isFree={betaMove.isFree}
            />
          </ListItemIcon>

          <ListItemText
            primary={
              <Box sx={{ color }}>{formatBodyPart(betaMove.bodyPart)}</Box>
            }
            secondary={betaMove.annotation}
          />
        </ListItemButton>
      </ListItem>
    );
  }
);

BetaMoveListItem.displayName = "BetaMoveListItem";

export default BetaMoveListItem;
