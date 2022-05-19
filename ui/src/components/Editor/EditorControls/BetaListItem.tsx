import {
  Box,
  FormControlLabel,
  IconButton,
  Input,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Radio,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ContentCopy as IconContentCopy,
  Delete as IconDelete,
  Done as IconDone,
  MoreVert as IconMoreVert,
  Edit as IconEdit,
} from "@mui/icons-material";
import React, { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { BetaListItem_betaNode$key } from "./__generated__/BetaListItem_betaNode.graphql";

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
  const [betaName, setBetaName] = useState<string>(beta.name);
  const [editingName, setEditingName] = useState<boolean>(false);

  const onCloseActions = (): void => setActionsAnchorEl(null);

  return (
    <Box
      key={beta.id}
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
      // Form enables name editing functionalities
      {...(editingName && {
        component: "form",
        onSubmit: (e: React.FormEvent<HTMLDivElement>) => {
          e.preventDefault(); // Prevent page reload from form
          setEditingName(false);
          onRename(beta.id, betaName);
        },
      })}
    >
      <FormControlLabel
        value={beta.id}
        control={<Radio disabled={disabled} />}
        label={
          <>
            {/* Show text box when editing name */}
            {editingName ? (
              <Input
                autoFocus
                value={betaName}
                onChange={(e) => setBetaName(e.target.value)}
                sx={{ display: "block" }}
              />
            ) : (
              // Missing name indicates it's still loading
              <Typography>{betaName || <Skeleton />}</Typography>
            )}
            <Typography variant="subtitle2" color="text.secondary">
              {beta.moves.edges.length} moves
            </Typography>
          </>
        }
      />

      {editingName ? (
        <Tooltip title="Save Changes">
          <IconButton type="submit" color="success">
            <IconDone />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Beta Actions">
          <IconButton
            aria-controls={actionsOpen ? "actions-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={actionsOpen ? "true" : undefined}
            onClick={(e) =>
              setActionsAnchorEl((prev) => (prev ? null : e.currentTarget))
            }
          >
            <IconMoreVert />
          </IconButton>
        </Tooltip>
      )}

      <Menu
        id={`${beta.id}-actions`}
        anchorEl={actionsAnchorEl}
        open={actionsOpen}
        onClose={onCloseActions}
      >
        <MenuItem
          onClick={() => {
            setEditingName(true);
            // Close menu so we can focus on the name text box
            onCloseActions();
          }}
        >
          <ListItemIcon>
            <IconEdit />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => onCopy(beta.id)}>
          <ListItemIcon>
            <IconContentCopy />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>

        {/* TODO red coloring */}
        <MenuItem
          onClick={() => {
            if (
              window.confirm(`Are you sure you want to delete ${betaName}?`)
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
    </Box>
  );
};

export default BetaListItem;
