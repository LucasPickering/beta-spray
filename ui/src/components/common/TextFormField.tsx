import { StandardTextFieldProps, TextField } from "@mui/material";
import React from "react";
import { isDefined } from "util/func";
import { FieldState } from "util/useForm";

interface Props extends StandardTextFieldProps {
  isEditing: boolean;
  state: FieldState;
  children?: React.ReactElement;
}

/**
 * An editable text field in a form. Meant to be used with {@link useForm} to
 * render one field in a form. When the field is not being edited, the value
 * will be displayed as plain text. For values that need additional formatting,
 * you can pass an element as a child. The text value will be injected as the
 * child of this child to render it.
 */
const TextFormField: React.FC<Props> = ({
  isEditing,
  state: { value, setValue, error },
  children = <></>,
  ...rest
}) => {
  if (isEditing) {
    const hasError = isDefined(error);

    return (
      <TextField
        size="small"
        value={value}
        error={hasError}
        helperText={error}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
        {...rest}
      />
    );
  }

  // Inject the value as a grandchild
  return React.cloneElement(children, { children: value });
};

export default TextFormField;
