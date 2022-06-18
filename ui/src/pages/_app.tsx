import React from "react";
import { AppProps } from "next/app";
import environment from "util/environment";
import { RelayEnvironmentProvider } from "react-relay";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "util/theme";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { NextPage } from "next";
import PageLayout from "components/PageLayout";

/**
 * Support additional metadata fields defined on page components
 */
type NextPageExtended = NextPage & {
  /**
   * If true, don't render the typicaly page layout wrapper
   */
  isFullscreen?: boolean;
};

interface Props extends AppProps {
  Component: NextPageExtended;
}

const App: React.FC<Props> = ({ Component, pageProps }) => (
  <HelmetProvider>
    {/* Default metadata, overriden by some pages */}
    <Helmet>
      <title>Beta Spray</title>
      <meta name="description" content="Create and share bouldering beta" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://betaspray.net/" />
    </Helmet>

    <RelayEnvironmentProvider environment={environment}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* Skip the page wrapper for fullscreen pages */}
        {Component.isFullscreen ? (
          <Component {...pageProps} />
        ) : (
          <PageLayout>
            {" "}
            <Component {...pageProps} />
          </PageLayout>
        )}
      </ThemeProvider>
    </RelayEnvironmentProvider>
  </HelmetProvider>
);

export default App;
