import React, { Suspense } from "react";

// Defer loading MUI into another chunk
const CoreContent = React.lazy(() => import("components/CoreContent"));

/**
 * The root React node. All content is deferred to another chunk so the only
 * vendor we have to load here is React. This keeps the entrypoint chunk smol.
 */
const App: React.FC = () => {
  return (
    <Suspense fallback="Loading...">
      <CoreContent />
    </Suspense>
  );
};

export default App;
