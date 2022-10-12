import { Box, Typography } from "@mui/material";

interface Props {
  error?: Error;
}

const ErrorMessage: React.FC<Props> = () => (
  <Box
    width="100%"
    height="100%"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
  >
    <Typography variant="h4" component="p">
      An error occurred, try again.
    </Typography>
    <Typography variant="h6" component="p">
      If it persists, please report it!
    </Typography>
  </Box>
);

export default ErrorMessage;
