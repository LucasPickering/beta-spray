import { MutationState } from "util/useMutation";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Portal,
  Snackbar,
} from "@mui/material";
import {
  Close as IconClose,
  ExpandMore as IconExpandMore,
} from "@mui/icons-material";

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
const MutationError: React.FC<Props> = ({ state, message }) => {
  // Error to be rendered. Populated when an error occurs, and maintained until
  // the next error occurs. If the underlying hook state resets or the snackbar
  // closes, we maintain the error to prevent rendering bugs.
  const [error, setError] = useState<MutationError | undefined>();
  // hidden - render nothing
  // closed - short form visible
  // open - expanded to show full error
  const [visibility, setVisibility] = useState<"hidden" | "closed" | "open">(
    "hidden"
  );

  // Open when an error first occurs, then we'll time out to clear state
  useEffect(() => {
    if (state.status === "error") {
      setError(state.error);
      setVisibility("closed");
    }
  }, [state]);

  // We need a portal in order to render from components that live within the
  // SVG tree, since HTML elements aren't supported in that part of the DOM.
  return (
    <Portal>
      <Snackbar
        open={visibility !== "hidden"}
        // Once the user has expanded the accordion, we don't want to auto-hide
        // since they're probably reading the error (which may be long)
        autoHideDuration={visibility !== "open" ? 5000 : null}
        onClose={() => setVisibility("hidden")}
      >
        <Alert severity="error">
          <Accordion
            expanded={visibility === "open"}
            // If already expanded, another click will *close the whole snackbar*.
            // At that point, we assume the user is done with the error entirely.
            onChange={(e, isExpanded) =>
              setVisibility(isExpanded ? "open" : "hidden")
            }
            // Match error background
            sx={{ backgroundColor: "transparent" }}
          >
            <AccordionSummary
              expandIcon={
                visibility === "open" ? <IconClose /> : <IconExpandMore />
              }
            >
              {message}
            </AccordionSummary>
            <AccordionDetails>
              {error &&
                (error.data instanceof Error ? (
                  error.data.toString()
                ) : (
                  <pre>{JSON.stringify(error.data, null, 2)}</pre>
                ))}
            </AccordionDetails>
          </Accordion>
        </Alert>
      </Snackbar>
    </Portal>
  );
};

export default MutationError;
