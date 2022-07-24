import {
  Drawer,
  DrawerProps,
  IconButton,
  IconButtonProps,
} from "@mui/material";
import { Menu as IconMenu } from "@mui/icons-material";
import React, { useState } from "react";

interface Props extends DrawerProps {
  ButtonProps?: IconButtonProps;
}

/**
 * A drawer with a toggle button to operate it. The button will be rendered
 * wherever this drawer appears in the tree, then the drawer will float on top
 * of the screen.
 */
const ToggleDrawer: React.FC<Props> = ({ ButtonProps, ...rest }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <IconButton onClick={() => setIsOpen((prev) => !prev)} {...ButtonProps}>
        <IconMenu />
      </IconButton>

      <Drawer open={isOpen} onClose={() => setIsOpen(false)} {...rest} />
    </>
  );
};

export default ToggleDrawer;
