import { Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React from "react";
import Logo from "./Logo";

const HeaderBar: React.FC = ({ children }) => (
  <Toolbar variant="dense">
    <Typography component="h1" variant="h5">
      <Link component={RouterLink} to="/" sx={{ textDecoration: "none" }}>
        <Logo />
      </Link>
    </Typography>

    {children}
  </Toolbar>
);

export default HeaderBar;
