import {
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import React, { useContext } from "react";
import { Handyman as IconHandyman } from "@mui/icons-material";
import { EditorModeContext, EditorMode } from "util/context";
import { IconLogo } from "components/common/icons";
import { isDefined } from "util/func";

const modes: Array<{
  mode: EditorMode;
  text: string;
  icon: React.ReactElement;
}> = [
  {
    mode: "holds",
    text: "Holds",
    icon: <IconHandyman />,
  },
  {
    mode: "beta",
    text: "Beta",
    icon: <IconLogo />,
  },
];

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
  const [mode, setMode] = useContext(EditorModeContext);

  // The icon button cycles through modes
  if (iconOnly) {
    // Find the next mode in the cycle, and decorate the button to match it
    const currentIndex = modes.findIndex((el) => el.mode === mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    const next = modes[nextIndex];

    // Set button contents/behavior based on our current mode
    const onClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
      setMode(next.mode);
      if (onClickParent) {
        onClickParent(e);
      }
    };

    return (
      <Tooltip title={`Edit ${next.text}`}>
        <IconButton onClick={onClick}>{next.icon}</IconButton>
      </Tooltip>
    );
  }

  // THe full button shows all possible modes
  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      fullWidth
      color="primary"
      size="small"
      onChange={(e, value: EditorMode | null) => {
        // Value is null if re-selecting the active button
        if (isDefined(value)) {
          setMode(value);
        }
      }}
    >
      {modes.map(({ mode, text, icon }) => (
        <ToggleButton key={mode} value={mode}>
          <Stack direction="row" spacing={1}>
            {icon} <span>{text}</span>
          </Stack>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default ModeButton;
