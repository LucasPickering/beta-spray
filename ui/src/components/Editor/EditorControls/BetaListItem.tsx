import {
  Box,
  FormControlLabel,
  IconButton,
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
  MoreVert as IconMoreVert,
} from "@mui/icons-material";
import React from "react";
import { graphql, useFragment } from "react-relay";
import { BetaListItem_betaNode$key } from "./__generated__/BetaListItem_betaNode.graphql";

interface Props {
  betaKey: BetaListItem_betaNode$key;
  disabled?: boolean;
  onCopy: (betaId: string) => void;
  onDelete: (betaId: string) => void;
}

const BetaListItem: React.FC<Props> = ({
  betaKey,
  disabled = false,
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

  return (
    <Box
      key={beta.id}
      sx={{
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <FormControlLabel
        value={beta.id}
        control={<Radio disabled={disabled} />}
        label={
          <>
            {/* Missing name indicates it's still loading */}
            <Typography>{beta.name || <Skeleton />}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {beta.moves.edges.length} moves
            </Typography>
          </>
        }
      />

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
      <Menu
        id={`${beta.id}-actions`}
        anchorEl={actionsAnchorEl}
        open={actionsOpen}
        onClose={() => setActionsAnchorEl(null)}
      >
        <MenuItem onClick={() => onCopy(beta.id)}>
          <ListItemIcon>
            <IconContentCopy />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        {/* TODO red coloring */}
        <MenuItem onClick={() => onDelete(beta.id)}>
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
