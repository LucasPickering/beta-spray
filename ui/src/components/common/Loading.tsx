import { Box, CircularProgress } from "@mui/material";
import React from "react";

type Props = Pick<
  React.ComponentProps<typeof CircularProgress>,
  "color" | "size" | "variant"
> &
  React.ComponentProps<typeof Box>;

/**
 * Loading icon. Includes a wrapper div that fills its parent and centers the
 * loading icon. This is generally what we want, but if not you can override
 * those props.
 *
 * *Warning:* Do *not* use this from the app root, because it
 * pulls in Material UI, which we don't want in the entrypoint chunk.
 */
const Loading: React.FC<Props> = ({ color, size, variant, ...rest }) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    width="100%"
    height="100%"
    {...rest}
  >
    <CircularProgress color={color} size={size} variant={variant} />
  </Box>
);

export default Loading;
