import { Box, Typography } from "@mui/material";
import React from "react";

const NotFound: React.FC = () => (
  <Box
    width="100%"
    height="100%"
    display="flex"
    justifyContent="center"
    alignItems="center"
  >
    <div>
      <Typography variant="h2" component="div" textAlign="center">
        ¯\_(ツ)_/¯
      </Typography>
      <Typography variant="h4" component="div" textAlign="center">
        Not Found
      </Typography>
    </div>
  </Box>
);

export default NotFound;
