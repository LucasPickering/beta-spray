import { Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React from "react";

const HeaderBar: React.FC = ({ children }) => (
  <Toolbar>
    <Typography component="h1" variant="h5">
      <Link component={RouterLink} to="/">
        Beta Spray
      </Link>
    </Typography>

    {children}
  </Toolbar>
);

export default HeaderBar;
