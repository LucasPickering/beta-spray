import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import EditorLoader from "components/Editor/EditorLoader";
import Loading from "components/Loading";
import NotFound from "components/NotFound";
import Home from "components/Home/Home";
import environment from "util/environment";
import theme from "util/theme";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import PageLayout from "components/PageLayout";
import ErrorBoundary from "components/ErrorBoundary";

const App: React.FC = () => {
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

export default App;
