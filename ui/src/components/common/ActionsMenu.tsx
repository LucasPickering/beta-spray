import { useId, useState } from "react";
import { IconButton, Menu } from "@mui/material";
import { MoreVert as IconMoreVert } from "@mui/icons-material";

interface Props {
  title: string;
  icon?: React.ReactElement;
  children?: React.ReactNode;
}

/**
 * A popup menu with actions in it. Children should all be <MenuItem>s
 */
const ActionsMenu: React.FC<Props> = ({
  title,
  icon = <IconMoreVert />,
  children,
}) => {
  const [menuAnchorElement, setMenuAnchorElement] =
    useState<HTMLElement | null>(null);
  const actionsOpen = Boolean(menuAnchorElement);
  const menuId = useId();

  const onClose = (): void => setMenuAnchorElement(null);

  return (
    <>
      <IconButton
        aria-label={title}
        aria-controls={actionsOpen ? menuId : undefined}
        aria-haspopup
        aria-expanded={actionsOpen}
        onClick={(e) =>
          setMenuAnchorElement((prev) => (prev ? null : e.currentTarget))
        }
      >
        {icon}
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={menuAnchorElement}
        open={actionsOpen}
        onClick={onClose}
        onClose={onClose}
      >
        {children}
      </Menu>
    </>
  );
};

export default ActionsMenu;
