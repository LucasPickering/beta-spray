import { Check as IconCheck, Clear as IconClear } from "@mui/icons-material";
import {
  Box,
  ClickAwayListener,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React from "react";
import { FormEvent, useEffect, useState } from "react";
import { isDefined } from "util/func";

interface Props {
  value: string;
  placeholder?: string;
  validator?: (value: string) => string | undefined;
  onChange?: (newValue: string) => void;
  children?: React.ReactElement;
}

/**
 * The default validator. Disallows empty and egregiously long strings.
 */
function validateString(value: string): string | undefined {
  // Disallow empty strings OR whitespace-only strings
  if (value.trim().length === 0) {
    return "Cannot be empty";
  }
  if (value.length > 100) {
    return "Too long";
  }
  return undefined;
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
const Editable: React.FC<Props> = ({
  value,
  placeholder,
  validator = validateString,
  onChange,
  children = <></>,
}) => {
  const [currentValue, setCurrentValue] = useState<string>(value);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const onSave = (): void => {
    // Tell the parent a new value was saved
    if (onChange && value !== currentValue) {
      onChange(currentValue);
    }

    setIsEditing(false);
    setCurrentValue(value);
  };
  const onReset = (): void => {
    setIsEditing(false);
    setCurrentValue(value);
  };

  // Whenever the outside value changes, reset our state
  useEffect(onReset, [value]);

  if (isEditing) {
    const validationError = validator(currentValue);
    const hasError = isDefined(validationError);

    return (
      <ClickAwayListener onClickAway={hasError ? onReset : onSave}>
        {/* Use a form so we can capture enter presses */}
        <Box
          component="form"
          position="relative"
          // Submission does nothing while there's an error. This feels the
          // most natural to me - better than resetting
          onSubmit={hasError ? (e: FormEvent) => e.preventDefault() : onSave}
        >
          <TextField
            autoFocus
            size="small"
            value={currentValue}
            placeholder={placeholder}
            error={hasError}
            helperText={validationError}
            onChange={(e) => setCurrentValue(e.target.value)}
            // There's no native behavior to listen for escape key, so we'll
            // need to do that manually
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onReset();
              }
            }}
            fullWidth
          />

          <Stack
            // Position at the bottom-right of the text box
            position="absolute"
            right={0}
            bottom={-26}
            direction="row"
            spacing={1}
          >
            <IconButton aria-label="cancel" size="small" onClick={onReset}>
              <IconClear />
            </IconButton>
            <IconButton aria-label="save" size="small" onClick={onSave}>
              <IconCheck />
            </IconButton>
          </Stack>
        </Box>
      </ClickAwayListener>
    );
  }

  // Not editing yet, just render the text
  return (
    <Box
      component="button" // Get clickable accesibility, tab focus, etc.
      aria-label={`Edit ${placeholder}`}
      onClick={() => setIsEditing(true)}
      sx={({ palette, shape, spacing }) => ({
        all: "unset", // Remove default button style
        width: "100%",
        "&:hover, &:focus": {
          margin: `${spacing(-0.5)} ${spacing(-1)}`,
          padding: `${spacing(0.5)} ${spacing(1)}`,
          borderRadius: shape.borderRadius,
        },
        "&:hover": {
          backgroundColor: palette.action.hover,
        },
        "&:focus": {
          backgroundColor: palette.action.focus,
        },
      })}
    >
      {/* If we were given a child, then re-instantiate that with the given
          value. By default this will just rendered unwrapped text, but allows
          us to do Typography, Link, etc. as children. If there is no value yet
          though, then render placeholder text so there's something to click. */}
      {value ? (
        React.cloneElement(children, { children: value })
      ) : (
        <Typography sx={({ palette }) => ({ color: palette.text.disabled })}>
          {placeholder}
        </Typography>
      )}
    </Box>
  );
};

export default Editable;
