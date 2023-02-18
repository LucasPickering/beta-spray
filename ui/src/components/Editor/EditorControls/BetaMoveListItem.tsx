import React from "react";
import {
  DragHandle as IconDragHandle,
  Close as IconClose,
} from "@mui/icons-material";
import {
  alpha,
  Box,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { formatBodyPart } from "components/Editor/util/svg";
import { graphql, useFragment } from "react-relay";
import { BetaMoveListItem_betaMoveNode$key } from "./__generated__/BetaMoveListItem_betaMoveNode.graphql";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import { isDefined } from "util/func";
import { useBetaMoveColor } from "../util/moves";

interface Props extends React.ComponentProps<typeof ListItem> {
  betaMoveKey: BetaMoveListItem_betaMoveNode$key;
  stanceColor?: string;
  isHighlighted?: boolean;
  isDragging?: boolean;
  dragRef?: React.Ref<SVGSVGElement>;
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
      isHighlighted = false,
      isDragging = false,
      dragRef,
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
          hold {
            id
          }
        }
      `,
      betaMoveKey
    );
    const isFree = !isDefined(betaMove.hold);

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
        disablePadding
        sx={[
          {
            userSelect: "none",
            // Normally this is inherit from the <ol>, but that isn't present
            // for the preview version, so let's be a homie and fix it here
            listStyle: "none",
          },
          isHighlighted &&
            (({ palette }) => ({
              // Match the color used in the SVG
              backgroundColor: alpha(
                palette.info.main,
                palette.action.activatedOpacity
              ),
            })),
          // Use opacity to hide the original move while dragging, because we
          // want the element to remain in the doc flow and keep producing events
          isDragging && { opacity: 0 },
        ]}
        {...rest}
      >
        <ListItemButton
          sx={[
            // If we're in the current stance, add a little indicator line
            isDefined(stanceColor) && {
              borderLeft: `3px solid ${stanceColor}`,
              marginLeft: "-3px",
            },
          ]}
        >
          <ListItemIcon>
            {/* Only use the drag icon for dragging, to prevent interfering with
              scrolling on mobile */}
            <IconDragHandle
              ref={dragRef}
              sx={{ paddingRight: 1, cursor: "grab" }}
            />
            <BetaMoveIconWrapped
              bodyPart={betaMove.bodyPart}
              order={betaMove.order}
              color={color}
              isStart={betaMove.isStart}
              isFree={isFree}
            />
          </ListItemIcon>

          <ListItemText
            primary={
              <Box
                sx={[
                  { color },
                  // Apply text decoration to mimic the outline features on the
                  // move icon. Order here is important to get the proper
                  // precedence
                  isFree && {
                    textDecorationLine: "underline",
                    textDecorationStyle: "dashed",
                    textDecorationColor: "white",
                  },
                  betaMove.isStart &&
                    (({ palette }) => ({
                      textDecorationLine: "underline",
                      textDecorationColor: palette.secondary.main,
                    })),
                ]}
              >
                {formatBodyPart(betaMove.bodyPart)}
              </Box>
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
