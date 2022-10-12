import { Box, ClickAwayListener, TextField } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { isDefined } from "util/func";

interface Props {
  value: string;
  validator?: (value: string) => string | undefined;
  onChange?: (newValue: string) => void;
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
  validator = validateString,
  onChange,
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
          // Submission does nothing while there's an error. This feels the
          // most natural to me - better than resetting
          onSubmit={hasError ? (e: FormEvent) => e.preventDefault() : onSave}
        >
          <TextField
            autoFocus
            size="small"
            value={currentValue}
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
            // Don't join document flow, to prevent text wrapping
            position: "absolute",
          },
        },
      }}
    >
      {value}
    </Box>
  );
};

export default Editable;
