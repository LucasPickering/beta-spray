import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import EditorLoader from "components/Editor/EditorLoader";
import Loading from "components/Loading";
import NotFound from "components/NotFound";
import Home from "components/Home";
import environment from "util/environment";
import theme from "util/theme";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

const App: React.FC = () => {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="" element={<Home />} />
              <Route path="images/:imageId" element={<EditorLoader />}>
                {/* These routes are just aliases to pre-select values */}
                <Route path="problems/:problemId" element={<EditorLoader />}>
                  <Route path="beta/:betaId" element={<EditorLoader />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  );
};

export default App;
