import React, { Suspense, useMemo } from "react";
import { AppProps } from "next/app";
import { createEnvironment } from "util/environment";
import { RelayEnvironmentProvider } from "react-relay";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "util/theme";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { NextPage } from "next";
import PageLayout from "components/PageLayout";
import Hydrate from "components/Hydrate";
import { PageQueryRefProps } from "util/relay";

/**
 * Support additional metadata fields defined on page components
 */
export type NextPageExtended<Props> = NextPage<Props> & {
  /**
   * If true, don't render the typicaly page layout wrapper
   */
  isFullscreen?: boolean;
};

interface Props extends AppProps {
  Component: NextPageExtended<PageQueryRefProps>;
}

const App: React.FC<Props> = ({ Component, pageProps }) => {
  // Initialize relay environment
  const environment = useMemo(() => createEnvironment(), []);

  return (
    <HelmetProvider>
      {/* Default metadata, overriden by some pages */}
      <Helmet>
        <title>Beta Spray</title>
        <meta name="description" content="Create and share bouldering beta" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://betaspray.net/" />
      </Helmet>

      <Suspense fallback={null}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <RelayEnvironmentProvider environment={environment}>
            <PageLayout fullscreen={Component.isFullscreen}>
              <Hydrate Component={Component} props={pageProps} />
            </PageLayout>
          </RelayEnvironmentProvider>
        </ThemeProvider>
      </Suspense>
    </HelmetProvider>
  );
};

export default App;
