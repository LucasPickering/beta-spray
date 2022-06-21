import { AppBar, Box } from "@mui/material";
import React, { Suspense } from "react";
import Loading from "./common/Loading";
import Footer from "./Footer";
import HeaderBar from "./HeaderBar";

interface Props {
  fullscreen?: boolean;
  children?: React.ReactNode;
}

const PageLayout: React.FC<Props> = ({ fullscreen = false, children }) =>
  // Fullscreen page layout just means wrap it in nothing
  fullscreen ? (
    <>{children}</>
  ) : (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <AppBar position="static">
        <HeaderBar />
      </AppBar>
      <Box margin={2}>
        {/* Generally each page should provide its own suspenses, this is a backup */}
        <Suspense fallback={<Loading />}>{children}</Suspense>
      </Box>
      <Footer />
    </Box>
  );

export default PageLayout;
