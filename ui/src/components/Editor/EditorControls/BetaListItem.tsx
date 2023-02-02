import React, { useId } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  Skeleton,
} from "@mui/material";
import {
  ContentCopy as IconContentCopy,
  Delete as IconDelete,
  MoreVert as IconMoreVert,
} from "@mui/icons-material";
import { graphql, useFragment } from "react-relay";
import { BetaListItem_betaNode$key } from "./__generated__/BetaListItem_betaNode.graphql";
import Editable from "components/common/Editable";
import { isDefined } from "util/func";
import TooltipIconButton from "components/common/TooltipIconButton";

interface Props {
  betaKey: BetaListItem_betaNode$key;
  disabled?: boolean;
  onRename: (betaId: string, newName: string) => void;
  onCopy: (betaId: string) => void;
  onDelete: (betaId: string) => void;
}

const BetaListItem: React.FC<Props> = ({
  betaKey,
  disabled = false,
  onRename,
  onCopy,
  onDelete,
}) => {
  const beta = useFragment(
    graphql`
      fragment BetaListItem_betaNode on BetaNode {
        id
        name
        moves {
          edges {
            cursor
          }
        }
      }
    `,
    betaKey
  );

  const [actionsAnchorEl, setActionsAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const actionsOpen = Boolean(actionsAnchorEl);
  const controlId = useId();
  const menuId = useId();

  const onCloseActions = (): void => setActionsAnchorEl(null);

  return (
    <ListItem
      key={beta.id}
      disablePadding
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <ListItemIcon>
        <Radio id={controlId} value={beta.id} disabled={disabled} />
      </ListItemIcon>
      <ListItemText
        primary={
          isDefined(beta.name) ? (
            <label htmlFor={controlId}>
              <Editable
                value={beta.name}
                placeholder="Beta Name"
                onChange={(newValue) => onRename(beta.id, newValue)}
              />
            </label>
          ) : (
            // Missing name indicates it's still loading
            <Skeleton />
          )
        }
        secondary={`${beta.moves.edges.length} moves`}
      />

      <TooltipIconButton
        title="Beta Actions"
        aria-controls={actionsOpen ? menuId : undefined}
        aria-haspopup
        aria-expanded={actionsOpen}
        onClick={(e) =>
          setActionsAnchorEl((prev) => (prev ? null : e.currentTarget))
        }
      >
        <IconMoreVert />
      </TooltipIconButton>

      <Menu
        id={menuId}
        anchorEl={actionsAnchorEl}
        open={actionsOpen}
        onClick={onCloseActions}
        onClose={onCloseActions}
      >
        <MenuItem onClick={() => onCopy(beta.id)}>
          <ListItemIcon>
            <IconContentCopy />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (
              window.confirm(`Are you sure you want to delete ${beta.name}?`)
            ) {
              onDelete(beta.id);
            }
          }}
        >
          <ListItemIcon>
            <IconDelete />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </ListItem>
  );
};

export default BetaListItem;
