import { useEffect, useState } from "react";
import { isDefined, mapValues } from "./func";

interface Field<T = string> {
  initialValue: T;
  validator?: Validator<T>;
}

export type Validator<T> = (value: T) => T | undefined;

export interface FieldState<T> {
  value: T;
  setValue: React.Dispatch<T>;
  error: string | undefined;
}

/**
 * Mapping of input fields, where each field can have its own value type.
 */
type Fields<O extends Record<string, unknown>> = {
  [K in keyof O]: Field<O[K]>;
};

/**
 * Mapping of output field states, where each field can have its own value type.
 */
type FieldStates<O extends Record<string, unknown>> = {
  [K in keyof O]: FieldState<O[K]>;
};

interface ReturnValue<F> {
  hasChanges: boolean;
  hasError: boolean;
  fieldStates: F;
  /**
   * Reset all fields to their initial values
   */
  onReset: () => void;
}

/**
 * A hook for managing a multi-field form. This manages the state for each field,
 * and makes it easy to toggle editing mode, modify fields, reset state, etc.
 * Meant to be used in conjunction with {@link TextFormField}. The caller is
 * responsible for all rendering, such as edit/save/cancel buttons. The types
 * are set up such that each form field can have its own type, and the return
 * types will match the input types.
 * @template O Type mapping to define the value type for each form field
 * @param fields Definition of each field in the form
 * @param reset Optional flag to trigger a state reset. Useful to enable
 *  whenever the form is rendered but hidden (e.g. dialog is closed)
 * @returns State and callbacks for managing the form
 */
export default function useForm<O extends Record<string, unknown>>(
  fields: Fields<O>,
  reset: boolean = true
): ReturnValue<FieldStates<O>> {
  const [hasChanges, setHasChanges] = useState(false);
  const [fieldValues, setFieldValues] = useState<O>(() =>
    mapValues(fields, ({ initialValue }) => initialValue)
  );

  const onReset = (): void => {
    setHasChanges(false);
    setFieldValues(mapValues(fields, ({ initialValue }) => initialValue));
  };

  // Reset state whenever requested. We intentionally *don't* listen to
  // initialValues to trigger an automatic reset, because we don't want to
  // reset the form when there's an error.
  useEffect(() => {
    if (reset) {
      onReset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reset]);

  const fieldStates: FieldStates<O> = mapValues(
    fields,
    ({ validator }, fieldName) => {
      const value = fieldValues[fieldName];
      // These type coercions are a bit wonky, but it's hard to convince TS
      // that we're soundly iterating over an interface that could have
      // different value types. The runtime semantics are pretty sound though.
      return {
        value,
        setValue: (v: O[typeof fieldName]): void => {
          setFieldValues((old) => ({ ...old, [fieldName]: v }));
          setHasChanges(true);
        },
        error: validator?.(value),
      } as FieldStates<O>[typeof fieldName];
    }
  );

  // Check if *any* fields have a validation error
  const hasError = Object.values(fieldStates).some(({ error }) =>
    isDefined(error)
  );

  return { hasError, hasChanges, fieldStates, onReset };
}
