import React, { Suspense } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import environment from "util/environment";
import Loading from "components/common/Loading";
import NotFound from "components/common/NotFound";
import theme from "util/theme";
import PageLayout from "components/PageLayout";
import ErrorBoundary from "components/common/ErrorBoundary";
import Home from "components/Home/Home";
import { Helmet, HelmetProvider } from "react-helmet-async";

// Code splitting! Don't split the home page since it's tiny
const Editor = React.lazy(() => import("components/Editor/Editor"));

/**
 * The main visible page content. This should be loaded as a separate chunk from
 * the entrypoint, so we can defer loading MUI, Relay, React Router, etc.
 */
const CoreContent: React.FC = () => {
  return (
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
                <Routes>
                  {/* Fullscreen routes */}
                  <Route path={"problems/:problemId"} element={<Editor />}>
                    {/* Just an alias to pre-select beta */}
                    <Route path="beta/:betaId" element={<></>} />
                  </Route>

                  {/* Main route group */}
                  <Route
                    element={
                      <PageLayout>
                        <Outlet />
                      </PageLayout>
                    }
                  >
                    <Route index element={<Home />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </ThemeProvider>
        </BrowserRouter>
      </RelayEnvironmentProvider>
    </HelmetProvider>
  );
};

export default CoreContent;
