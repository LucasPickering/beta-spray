import { Link, Stack, Toolbar, Typography } from "@mui/material";
import React from "react";
import Logo from "./common/Logo";
import HeaderLink from "./common/HeaderLink";

interface Props {
  children?: React.ReactNode;
}

const HeaderBar: React.FC<Props> = ({ children }) => (
  <Toolbar variant="dense">
    <Typography component="h1" variant="h5">
      <Link href="/" sx={{ textDecoration: "none" }}>
        <Logo />
      </Link>
    </Typography>

    <Stack direction="row" spacing={2} marginLeft={2}>
      <HeaderLink to="/">Problems</HeaderLink>
      <HeaderLink to="/why">Why?</HeaderLink>
    </Stack>

    {children}
  </Toolbar>
);

export default HeaderBar;
