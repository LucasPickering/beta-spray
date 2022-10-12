import { AppBar, Box, useTheme } from "@mui/material";
import React, { Suspense } from "react";
import Loading from "./common/Loading";
import Footer from "./Footer";
import HeaderBar from "./HeaderBar";

interface Props {
  children?: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ children }) => {
  const { breakpoints } = useTheme();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      minHeight="100vh"
      sx={({ palette }) => ({ backgroundColor: palette.background.default })}
    >
      <AppBar position="static">
        <HeaderBar />
      </AppBar>
      <Box
        padding={2}
        // Always fill the screen, but not wider than MUI's largest breakpoint.
        // Otherwise, content gets too big to be digestible on large screens.
        width={`min(${breakpoints.values.xl}${breakpoints.unit}, 100vw)`}
      >
        {/* Generally each page should provide its own suspenses, this is a backup */}
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </Box>
      <Footer />
    </Box>
  );
};

export default PageLayout;
