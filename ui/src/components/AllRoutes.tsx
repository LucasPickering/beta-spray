import React, { useEffect } from "react";
import { Outlet, Route, Routes } from "react-router-dom";
import { useQueryLoader } from "react-relay";
import NotFound from "components/common/NotFound";
import queriesCurrentUserQuery from "util/__generated__/queriesCurrentUserQuery.graphql";
import type { queriesCurrentUserQuery as queriesCurrentUserQueryType } from "util/__generated__/queriesCurrentUserQuery.graphql";
import PageLayout from "components/PageLayout/PageLayout";
import ErrorBoundary from "components/common/ErrorBoundary";
import About from "./About";
import TextLayout from "./PageLayout/TextLayout";
import LogInPage from "./Account/LogInPage";

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
 * Main router. Also includes a root query for the current user, since that's
 * needed pretty much globally.
 */
const AllRoutes: React.FC = () => {
  const [currentUserQueryRef, loadCurrentUserQuery] =
    useQueryLoader<queriesCurrentUserQueryType>(queriesCurrentUserQuery);

  useEffect(() => {
    loadCurrentUserQuery({});
  }, [loadCurrentUserQuery]);

  return (
    <Routes>
      {/* Fullscreen routes */}
      <Route path={"problems/:problemId"} element={<Editor />}>
        {/* Just an alias to pre-select beta */}
        <Route path="beta/:betaId" element={null} />
      </Route>

      {/* Main route group */}
      <Route
        element={
          <PageLayout currentUserKeyQueryRef={currentUserQueryRef}>
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
          <Route
            path="/login"
            element={<LogInPage queryRef={currentUserQueryRef} />}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AllRoutes;
