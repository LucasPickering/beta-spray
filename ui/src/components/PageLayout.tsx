import { AppBar, Box } from "@mui/material";
import React from "react";
import HeaderBar from "./HeaderBar";

interface Props {
  children?: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }) => (
  <Box display="flex" flexDirection="column">
    <AppBar position="static">
      <HeaderBar />
    </AppBar>
    <Box margin={2}>{children}</Box>
  </Box>
);

export default PageLayout;
