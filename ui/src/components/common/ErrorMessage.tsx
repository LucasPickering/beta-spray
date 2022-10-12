import { Box, Typography } from "@mui/material";

interface Props {
  error?: Error;
}

const ErrorMessage: React.FC<Props> = () => (
  <Box>
    <Typography variant="h4" component="p">
      An error occurred
    </Typography>
  </Box>
);

export default ErrorMessage;
