import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import environment from "util/environment";
import Loading from "components/Loading";
import NotFound from "components/NotFound";
import theme from "util/theme";
import PageLayout from "components/PageLayout";
import ErrorBoundary from "components/ErrorBoundary";
import Home from "components/Home/Home";

// Code splitting! Don't split the home page since it's tiny
const EditorLoader = React.lazy(() => import("components/Editor/EditorLoader"));

/**
 * The main visible page content. This should be loaded as a separate chunk from
 * the entrypoint, so we can defer loading MUI, Relay, React Router, etc.
 */
const CoreContent: React.FC = () => {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <PageLayout>
            <Suspense fallback={<Loading />}>
              <ErrorBoundary>
                <Routes>
                  <Route path="" element={<Home />} />
                  <Route path="problems/:problemId" element={<EditorLoader />}>
                    {/* Just an alias to pre-select values */}
                    <Route path="beta/:betaId" element={<EditorLoader />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </Suspense>
          </PageLayout>
        </ThemeProvider>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  );
};

export default CoreContent;
