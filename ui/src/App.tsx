import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import environment from "util/environment";
import BoulderImageLoader from "components/BetaEditor/BetaEditorLoader";
import Loading from "components/Loading";
import { ThemeProvider } from "@emotion/react";
import theme from "@rebass/preset";

const App: React.FC = () => {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="images/:imageId" element={<BoulderImageLoader />} />
            </Routes>
          </Suspense>
        </ThemeProvider>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  );
};

export default App;
