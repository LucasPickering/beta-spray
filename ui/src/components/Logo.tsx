import React from "react";
import { Box, Typography } from "@mui/material";

const Logo: React.FC = () => (
  <Typography variant="h5" component="h1" display="flex" alignItems="center">
    <svg
      width="36"
      height="36"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="20" cy="82" fill="#f08080" r="12" />
      <circle cx="74" cy="60" fill="#f08080" r="12" />
      <circle cx="38" cy="18" fill="#f08080" r="12" />
      <line stroke="#f08080" strokeWidth="7" x1="20" y1="82" x2="74" y2="60" />
      <line stroke="#f08080" strokeWidth="7" x1="74" y1="60" x2="38" y2="18" />
    </svg>

    <Box marginLeft={1}>Beta Spray</Box>
  </Typography>
);

export default Logo;
