import { Link, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import React from "react";
import Logo from "./Logo";

interface Props {
  children?: React.ReactNode;
}

const HeaderBar: React.FC<Props> = ({ children }) => (
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
