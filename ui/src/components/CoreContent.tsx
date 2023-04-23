import React, { Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, GlobalStyles } from "@mui/material";
import environment from "util/environment";
import Loading from "components/common/Loading";
import theme, { globalStyles } from "util/theme";
import ErrorBoundary from "components/common/ErrorBoundary";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Outlet, Route, Routes } from "react-router-dom";
import NotFound from "components/common/NotFound";
import PageLayout from "components/PageLayout/PageLayout";
import AboutPage from "./AboutPage";
import TextLayout from "./PageLayout/TextLayout";
import LogInPage from "./Account/LogInPage";
import UserQueryProvider from "./UserQueryProvider";
import GuestUserWarningDialog from "./Account/GuestUserWarningDialog";

// Code splitting!
const HomePage = React.lazy(
  () => import(/* webpackChunkName: "Home" */ "components/Home/HomePage")
);
const EditorPage = React.lazy(
  () =>
    import(
      /* webpackChunkName: "Editor", webpackPrefetch: true */ "components/Editor/EditorPage"
    )
);

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
          <GlobalStyles styles={globalStyles} />

          <Suspense fallback={<Loading size={100} height="100vh" />}>
            <ErrorBoundary>
              <UserQueryProvider>
                {/* This dialog can appear on any page */}
                <GuestUserWarningDialog />

                <Routes>
                  {/* Fullscreen routes */}
                  <Route path={"problems/:problemId"} element={<EditorPage />}>
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
                    <Route index element={<HomePage />} />
                    {/* Make text-only pages narrower */}
                    <Route
                      element={
                        <TextLayout>
                          <Outlet />
                        </TextLayout>
                      }
                    >
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/login" element={<LogInPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Route>
                </Routes>
              </UserQueryProvider>
            </ErrorBoundary>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  </HelmetProvider>
);

export default CoreContent;
