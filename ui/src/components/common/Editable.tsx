import { Box, ClickAwayListener, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";

interface Props {
  value: string;
  onChange?: (newValue: string) => void;
}

/**
 * An editable piece of text. At rest, the text is rendered as normal and
 * inherits the parent text styles, meaning it should be rendered within a
 * Typography tag (or similar). Upon being clicked though, the text becomes
 * editable. This component will manage the editing state, and will only call
 * `onChange` when the user saves their changes. If the changes are canceled,
 * the parent is never notified. The parent is responsible for persisting the
 * changes (e.g. calling the API), otherwise this will just reset to the
 * original value upon saving.
 */
const Editable: React.FC<Props> = ({ value, onChange }) => {
  const [currentValue, setCurrentValue] = useState<string>(value);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const onSave = (): void => {
    setIsEditing(false);
    setCurrentValue(value);

    // Tell the parent a new value was saved
    if (onChange && value !== currentValue) {
      onChange(currentValue);
    }
  };
  const onReset = (): void => {
    setIsEditing(false);
    setCurrentValue(value);
  };

  // Whenever the outside value changes, reset our state
  useEffect(onReset, [value]);

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={onSave}>
        {/* Use a form so we can capture enter presses */}
        <Box component="form" onSubmit={onSave}>
          <TextField
            autoFocus
            size="small"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            // There's no native behavior to listen for escape key, so we'll
            // need to do that manually
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onReset();
              }
            }}
          />
        </Box>
      </ClickAwayListener>
    );
  }

  // Not editing yet, just render the text
  // The parent should've wrapped this component in a Typography, so we'll just
  // inherit those text styles
  return (
    <Box
      component="button" // Get clickable accesibility, tab focus, etc.
      aria-label="Edit Value"
      onClick={() => setIsEditing(true)}
      sx={{
        all: "unset", // Remove default button style
        "&:hover, &:focus": {
          "&::after": {
            // It'd be nice to use the proper MUI edit icon, but this is a lot
            // easier and works well enough
            content: '"✎"',
            marginLeft: 1,
          },
        },
      }}
    >
      {value}
    </Box>
  );
};

export default Editable;
