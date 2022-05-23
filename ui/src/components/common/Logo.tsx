import React from "react";
import { Box, Typography } from "@mui/material";
import { IconLogo } from "./icons";

/**
 * The full site logo, including the name
 */
const Logo: React.FC = () => (
  <Typography variant="h5" component="h1" display="flex" alignItems="center">
    <IconLogo color="primary" />

    <Box marginLeft={1}>Beta Spray</Box>
  </Typography>
);

export default Logo;
