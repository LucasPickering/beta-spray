import { isDefined } from "util/func";
import { FieldState } from "util/useForm";
import { StandardTextFieldProps, TextField } from "@mui/material";
import React, { useId } from "react";

interface Props<T> extends StandardTextFieldProps {
  state: FieldState<T>;
  children?: React.ReactNode;
}

/**
 * An editable text field in a form. Meant to be used with useForm to
 * render one field in a form.
 */
const TextFormField = <T extends string = string>({
  state: { value, setValue, error },
  children = <></>,
  ...rest
}: Props<T>): React.ReactElement => {
  const id = useId();

  return (
    <TextField
      id={id}
      size="small"
      value={value}
      error={isDefined(error)}
      helperText={error}
      onChange={(e) => setValue(e.target.value as T)}
      fullWidth
      {...rest}
    >
      {children}
    </TextField>
  );
};

export default TextFormField;
