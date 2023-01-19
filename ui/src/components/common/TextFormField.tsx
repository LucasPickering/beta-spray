import { TextField } from "@mui/material";
import { isDefined } from "util/func";
import { FieldState } from "util/useForm";

interface Props {
  isEditing: boolean;
  state: FieldState;
}

/**
 * An editable text field in a form. Meant to be used with {@link useForm} to
 * render one field in a form.
 */
const TextFormField: React.FC<Props> = ({
  isEditing,
  state: { value, setValue, error },
}) => {
  if (isEditing) {
    const hasError = isDefined(error);

    return (
      <TextField
        autoFocus
        size="small"
        value={value}
        error={hasError}
        helperText={error}
        onChange={(e) => setValue(e.target.value)}
        fullWidth
      />
    );
  }

  // Not editing yet, just render the text. The parent should've wrapped this
  // component in a Typography, so we'll just inherit those text styles.
  return <>{value}</>;
};

export default TextFormField;
