import { Link, Toolbar } from "@mui/material";
import RouterLink from "next/link";
import React from "react";
import Logo from "./common/Logo";

interface Props {
  children?: React.ReactNode;
}

const HeaderBar: React.FC<Props> = ({ children }) => (
  <Toolbar variant="dense">
    <RouterLink href="/" passHref>
      <Link sx={{ textDecoration: "none" }}>
        <Logo />
      </Link>
    </RouterLink>

    {children}
  </Toolbar>
);

export default HeaderBar;
