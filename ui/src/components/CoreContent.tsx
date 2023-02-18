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
import PageLayout from "components/PageLayout/PageLayout";
import ErrorBoundary from "components/common/ErrorBoundary";
import { Helmet, HelmetProvider } from "react-helmet-async";
import About from "./About";
import TextLayout from "./PageLayout/TextLayout";

// Code splitting!
const Home = React.lazy(
  () => import(/* webpackChunkName: "Home" */ "components/Home/Home")
);
const Editor = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Editor", webpackPrefetch: true */ "components/Editor/Editor"
    )
);

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
                    <Route path="beta/:betaId" element={null} />
                  </Route>

                  {/* Main route group */}
                  <Route
                    element={
                      <PageLayout>
                        {/* For some reason this doesn't work inside PageLayout
                            so we have to stick it here */}
                        <ErrorBoundary>
                          <Outlet />
                        </ErrorBoundary>
                      </PageLayout>
                    }
                  >
                    <Route index element={<Home />} />
                    {/* Make text-only pages narrower */}
                    <Route
                      element={
                        <TextLayout>
                          <Outlet />
                        </TextLayout>
                      }
                    >
                      <Route path="/about" element={<About />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
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
