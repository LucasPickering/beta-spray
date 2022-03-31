import { AppBar, Box } from "@mui/material";
import React from "react";
import HeaderBar from "./HeaderBar";

const PageLayout: React.FC = ({ children }) => (
  <Box display="flex" flexDirection="column">
    <AppBar position="static">
      <HeaderBar />
    </AppBar>
    <Box marginX={2}>{children}</Box>
  </Box>
);

export default PageLayout;
