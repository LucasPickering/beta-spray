import { MutationState } from "util/useMutation";
import React, { useEffect, useState } from "react";
import { Portal } from "@mui/material";
import ErrorSnackbar from "./ErrorSnackbar";

interface Props {
  state: MutationState;
  message: string;
}

type MutationError = Extract<MutationState, { status: "error" }>["error"];

/**
 * Render a mutation error in a snackbar. Designed to minimize boilerplate.
 * Simply pass the output state of a mutation to this with some additional
 * description of the use case, and the error will be rendered whenever
 * appropriate.
 */
const MutationErrorSnackbar: React.FC<Props> = ({ state, message }) => {
  // Error to be rendered. Populated when an error occurs, and maintained until
  // the next error occurs. If the underlying hook state resets or the snackbar
  // closes, we maintain the error to prevent rendering bugs.
  const [error, setError] = useState<MutationError | undefined>();

  // Open when an error first occurs, then we'll time out to clear state
  useEffect(() => {
    if (state.status === "error") {
      setError(state.error);
    }
  }, [state]);

  // We need a portal in order to render from components that live within the
  // SVG tree, since HTML elements aren't supported in that part of the DOM.
  return (
    <Portal>
      <ErrorSnackbar
        summary={message}
        error={error?.data}
        renderError={renderError}
      />
    </Portal>
  );
};

function renderError(error: unknown): React.ReactNode {
  return error instanceof Error ? (
    error.toString()
  ) : (
    <pre>{JSON.stringify(error, null, 2)}</pre>
  );
}

export default MutationErrorSnackbar;
