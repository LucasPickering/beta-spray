import { FieldState } from "util/useForm";
import { ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import React, { useId } from "react";

interface Props<T> extends ToggleButtonGroupProps {
  state: FieldState<T>;
  children?: React.ReactNode;
}

/**
 * A single-select button group in a form. Meant to be used with useForm to
 * render one field in a form.
 */
const ToggleButtonFormField = <T extends string = string>({
  state: { value, setValue },
  children = <></>,
  ...rest
}: Props<T>): React.ReactElement => {
  const id = useId();

  return (
    <ToggleButtonGroup
      id={id}
      value={value}
      exclusive
      onChange={(e, newValue) => setValue(newValue as T)}
      fullWidth
      {...rest}
    >
      {children}
    </ToggleButtonGroup>
  );
};

export default ToggleButtonFormField;
