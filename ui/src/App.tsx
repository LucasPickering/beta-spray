import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import environment from "util/environment";
import BoulderImageLoader from "components/BetaEditor/BetaEditorLoader";
import Loading from "components/Loading";
// TODO remove rebass/emotion
import { ThemeProvider } from "@emotion/react";
import theme from "@rebass/preset";
import NotFound from "components/NotFound";

const App: React.FC = () => {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="images/:imageId" element={<BoulderImageLoader />}>
                {/* These routes are just aliases to pre-select values */}
                <Route
                  path="problems/:problemId"
                  element={<BoulderImageLoader />}
                >
                  <Route path="beta/:betaId" element={<BoulderImageLoader />} />
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
