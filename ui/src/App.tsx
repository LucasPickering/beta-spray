import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { RelayEnvironmentProvider } from "react-relay";
import environment from "util/environment";
import BoulderImageLoader from "components/BoulderImageLoader";
import Loading from "components/Loading";

const App: React.FC = () => {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="images/:imageId" element={<BoulderImageLoader />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </RelayEnvironmentProvider>
  );
};

export default App;
