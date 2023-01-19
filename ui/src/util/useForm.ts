import { useState } from "react";
import { isDefined, mapValues } from "./func";
import { validateString } from "./validator";

interface Field {
  initialValue: string;
  validator?: Validator;
}

export type Validator = (value: string) => string | undefined;

export interface FieldState {
  value: string;
  setValue: React.Dispatch<string>;
  validator: Validator; // TODO remove?
  error: string | undefined;
}

interface ReturnValue<K extends string> {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  hasError: boolean;
  fieldState: Record<K, FieldState>;
  onReset: () => void;
}

/**
 * A hook for managing a multi-field form. This manages the state for each field,
 * and makes it easy to toggle editing mode, modify fields, reset state, etc.
 * Meant to be used in conjunction with {@link TextFormField}. The caller is
 * responsible for all rendering, such as edit/save/cancel buttons.
 * @param fields Definition of each field in the form
 * @returns State and callbacks for managing the form
 */
export default function useForm<K extends string>(
  fields: Record<K, Field>
): ReturnValue<K> {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<K, string>>(() =>
    mapValues(fields, ({ initialValue }) => initialValue)
  );

  const fieldState = mapValues(
    fields,
    ({ validator = validateString }, fieldName) => {
      const value = fieldValues[fieldName];
      const setValue = (v: string): void =>
        setFieldValues((old) => ({ ...old, [fieldName]: v }));
      return { value, setValue, validator, error: validator(value) };
    }
  );

  // Check if *any* fields have a validation error
  const hasError = Object.values<FieldState>(fieldState).some(({ error }) =>
    isDefined(error)
  );

  const onReset = (): void => {
    setFieldValues(mapValues(fields, ({ initialValue }) => initialValue));
  };

  return { isEditing, setIsEditing, hasError, fieldState, onReset };
}
