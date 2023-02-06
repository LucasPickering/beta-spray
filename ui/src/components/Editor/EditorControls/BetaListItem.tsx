import React, { useId } from "react";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Radio,
  Skeleton,
} from "@mui/material";
import {
  ContentCopy as IconContentCopy,
  Delete as IconDelete,
} from "@mui/icons-material";
import { graphql, useFragment } from "react-relay";
import { BetaListItem_betaNode$key } from "./__generated__/BetaListItem_betaNode.graphql";
import Editable from "components/common/Editable";
import { isDefined } from "util/func";
import ActionsMenu from "components/common/ActionsMenu";

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

  const controlId = useId();

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

      <ActionsMenu title="Beta Actions">
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
      </ActionsMenu>
    </ListItem>
  );
};

export default BetaListItem;
