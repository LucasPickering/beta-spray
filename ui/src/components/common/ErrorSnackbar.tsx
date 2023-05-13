import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Snackbar,
} from "@mui/material";
import {
  Close as IconClose,
  ExpandMore as IconExpandMore,
} from "@mui/icons-material";
import TimeProgress from "./TimeProgress";

interface Props<E> {
  summary: string;
  error: E | undefined;
  autoHideDuration?: number;
  renderError?: (error: E) => React.ReactNode;
}

/**
 * A popup snackbar to display an error message. This is useful for showing
 * async errors, typically during mutations. The snackbar will include an
 * accordion to display additional error info.
 *
 * Note: in most cases, you'll want to use MutationError instead of this
 * component, to handle even more boilerplate.
 *
 * @param summary A short (typically static) string describing error context
 * @param error The error object
 * @param renderError An optional function to render error objects
 */
function ErrorSnackbar<E extends object = Error>({
  summary,
  error,
  autoHideDuration = 5000,
  renderError = (error) => error.toString(),
}: Props<E>): React.ReactElement {
  // hidden - render nothing
  // summary - short form visible
  // detail - expanded to show full error
  const [visibility, setVisibility] = useState<"hidden" | "summary" | "detail">(
    "hidden"
  );

  // Open when an error first occurs, then we'll time out to clear state
  useEffect(() => {
    if (error) {
      setVisibility("summary");
    }
  }, [error]);

  return (
    <Snackbar
      open={visibility !== "hidden"}
      // Once the user has expanded the accordion, we don't want to auto-hide
      // since they're probably reading the error (which may be long)
      autoHideDuration={visibility !== "detail" ? autoHideDuration : null}
      sx={{ maxWidth: "sm" }}
      onClose={() => setVisibility("hidden")}
    >
      <Alert
        severity="error"
        icon={
          // If in decay mode, show a timer, otherwise a static icon
          visibility === "detail" ? undefined : (
            <TimeProgress
              color="inherit"
              size={22}
              duration={autoHideDuration}
              decay
            />
          )
        }
      >
        <Accordion
          elevation={0}
          disableGutters
          expanded={visibility === "detail"}
          // If already expanded, another click will *close the whole snackbar*.
          // At that point, we assume the user is done with the error entirely.
          onChange={(e, isExpanded) =>
            setVisibility(isExpanded ? "detail" : "hidden")
          }
          // Match error background
          sx={{ backgroundColor: "transparent" }}
        >
          <AccordionSummary
            expandIcon={
              visibility === "detail" ? <IconClose /> : <IconExpandMore />
            }
            sx={{
              minHeight: 0,
              "& .MuiAccordionSummary-content": {
                margin: 0,
              },
            }}
          >
            <AlertTitle>{summary}</AlertTitle>
          </AccordionSummary>
          <AccordionDetails>{error && renderError(error)}</AccordionDetails>
        </Accordion>
      </Alert>
    </Snackbar>
  );
}

export default ErrorSnackbar;
