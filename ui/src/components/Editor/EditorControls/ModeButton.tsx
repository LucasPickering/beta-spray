import { Button, IconButton, Tooltip } from "@mui/material";
import React, { useContext } from "react";
import { Handyman as IconHandyman } from "@mui/icons-material";
import { EditorContext, EditorMode } from "util/context";
import { IconLogo } from "components/common/icons";

interface Props {
  iconOnly?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/**
 * A button to switch between editor modes (holds vs beta)
 */
const ModeButton: React.FC<Props> = ({
  iconOnly = false,
  onClick: onClickParent,
}) => {
  const { mode, setMode } = useContext(EditorContext);

  // Set button contents/behavior based on our current mode
  const {
    icon,
    text,
    nextMode,
  }: { icon: React.ReactElement; text: string; nextMode: EditorMode } =
    mode === "holds"
      ? { icon: <IconLogo />, text: "Edit Beta", nextMode: "beta" }
      : { icon: <IconHandyman />, text: "Edit Holds", nextMode: "holds" };
  const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setMode(nextMode);
    if (onClickParent) {
      onClickParent(e);
    }
  };

  if (iconOnly) {
    return (
      <Tooltip title={text}>
        <IconButton onClick={onClick}>{icon}</IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      color="primary"
      variant="outlined"
      startIcon={icon}
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

export default ModeButton;
