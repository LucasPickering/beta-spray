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
const ToggleDrawer: React.FC<Props> = ({
  ButtonProps,
  variant = "temporary",
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Show/hide button is only needed in temporary mode */}
      {variant === "temporary" && (
        <IconButton onClick={() => setIsOpen((prev) => !prev)} {...ButtonProps}>
          <IconMenu />
        </IconButton>
      )}

      <Drawer
        variant={variant}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        {...rest}
      />
    </>
  );
};

export default ToggleDrawer;
