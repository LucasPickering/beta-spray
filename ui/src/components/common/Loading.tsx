import { Box, CircularProgress, Typography } from "@mui/material";

type Props = { message?: string } & Pick<
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
const Loading: React.FC<Props> = ({
  message,
  color,
  size,
  variant,
  ...rest
}) => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    flexDirection="column"
    width="100%"
    height="100%"
    {...rest}
  >
    <CircularProgress color={color} size={size} variant={variant} />
    {message && <Typography variant="h6">{message}</Typography>}
  </Box>
);

export default Loading;
