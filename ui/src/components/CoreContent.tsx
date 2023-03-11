import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import environment from "util/environment";
import Loading from "components/common/Loading";
import theme from "util/theme";
import ErrorBoundary from "components/common/ErrorBoundary";
import { Helmet, HelmetProvider } from "react-helmet-async";
import AllRoutes from "./AllRoutes";

/**
 * The main visible page content. This should be loaded as a separate chunk from
 * the entrypoint, so we can defer loading MUI, Relay, React Router, etc.
 */
const CoreContent: React.FC = () => (
  <HelmetProvider>
    {/* Default metadata, overriden by some children */}
    <Helmet>
      <title>Beta Spray</title>
      <meta name="description" content="Create and share bouldering beta" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://betaspray.net/" />
    </Helmet>

    <RelayEnvironmentProvider environment={environment}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <Suspense fallback={<Loading />}>
            <ErrorBoundary>
              <AllRoutes />
            </ErrorBoundary>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  </HelmetProvider>
);

export default CoreContent;
