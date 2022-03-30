import { Link, Toolbar } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React from "react";

const HeaderBar: React.FC = ({ children }) => (
  <Toolbar>
    <Link component={RouterLink} to="/" variant="h5">
      Beta Spray
    </Link>

    {children}
  </Toolbar>
);

export default HeaderBar;
