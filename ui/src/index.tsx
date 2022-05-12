import dayjs from "dayjs";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

// This assertion is chill because if it ever fails, we'll know very quickly.
// We don't want to bloat the main entrypoint with any unnecessary logic.
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
