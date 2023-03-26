import React, { useId, useState } from "react";
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
  Settings as IconSettings,
} from "@mui/icons-material";
import { graphql, useFragment } from "react-relay";
import { BetaListItem_betaNode$key } from "./__generated__/BetaListItem_betaNode.graphql";
import { isDefined } from "util/func";
import ActionsMenu from "components/common/ActionsMenu";
import Username from "components/Account/Username";
import BetaSettings from "./BetaSettings";

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
          totalCount
        }
        owner {
          ...UsernameDisplay_userNode
        }
        ...BetaSettings_betaNode
      }
    `,
    betaKey
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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
            <label htmlFor={controlId}>{beta.name}</label>
          ) : (
            // Missing name indicates it's still loading
            <Skeleton />
          )
        }
        secondary={<Username userKey={beta.owner} iconSize="small" />}
      />

      <ActionsMenu title="Beta Actions">
        <MenuItem onClick={() => onCopy(beta.id)}>
          <ListItemIcon>
            <IconContentCopy />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>

        <MenuItem onClick={() => setIsSettingsOpen(true)}>
          <ListItemIcon>
            <IconSettings />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (
              window.confirm(`Are you sure you want to delete ${beta.name}?`)
            ) {
              onDelete(beta.id);
            }
          }}
          sx={({ palette }) => ({ color: palette.error.main })}
        >
          <ListItemIcon>
            <IconDelete />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </ActionsMenu>

      <BetaSettings
        betaKey={beta}
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </ListItem>
  );
};

export default BetaListItem;
