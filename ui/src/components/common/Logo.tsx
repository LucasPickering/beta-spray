import React from "react";
import { Box, Typography } from "@mui/material";
import { IconLogo } from "./icons";

/**
 * The full site logo, including the name
 */
const Logo: React.FC = () => (
  <Box display="flex" alignItems="center">
    <IconLogo color="primary" />
    <Typography variant="h5" component="h1" marginLeft={1}>
      Beta Spray
    </Typography>
    <Typography
      variant="caption"
      sx={{ transform: "translate(-6px, -5px) rotate(45deg)" }}
    >
      alpha
    </Typography>
  </Box>
);

export default Logo;
