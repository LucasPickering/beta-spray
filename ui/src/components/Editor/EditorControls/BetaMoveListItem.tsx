import React from "react";
import {
  DragHandle as IconDragHandle,
  Close as IconClose,
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import { formatBodyPart, useBetaMoveColor } from "components/Editor/util/svg";
import { graphql, useFragment } from "react-relay";
import { BetaMoveListItem_betaMoveNode$key } from "./__generated__/BetaMoveListItem_betaMoveNode.graphql";
import { BetaMoveIconWrapped } from "../EditorSvg/BetaEditor/BetaMoveIcon";
import { isDefined } from "util/func";

interface Props extends React.ComponentProps<typeof ListItem> {
  betaMoveKey: BetaMoveListItem_betaMoveNode$key;
  isInCurrentStance?: boolean;
  dragRef?: React.Ref<SVGSVGElement>;
  onDelete?: () => void;
}

/**
 * A dumb component to render a beta move in a list.
 */
const BetaMoveListItem = React.forwardRef<HTMLLIElement, Props>(
  (
    { betaMoveKey, isInCurrentStance = false, dragRef, onDelete, sx, ...rest },
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
        sx={[
          // If we're in the current stance, add a little indicator line
          isInCurrentStance && {
            // TODO make sure this color corresponds to the stick figure somehow
            borderLeft: "3px solid white",
            marginLeft: "-3px", // Cancel out the space taken up by the border
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...rest}
      >
        <ListItemIcon>
          {/* Only use the drag icon for dragging, to prevent interfering with
              scrolling on mobile */}
          <IconDragHandle ref={dragRef} sx={{ paddingRight: 1 }} />
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

        {/* Preview version of the element shouldn't show this button. Note: this
            actually impacts the DOM layout! When this element isn't present, MUI
            leaves out an extra container component, which fixes some other
            styling issues. */}
        {onDelete && (
          <ListItemSecondaryAction>
            <IconButton
              aria-label={`delete move ${betaMove.order}`}
              size="small"
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
