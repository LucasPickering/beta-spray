import dayjs from "dayjs";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import localizedFormat from "dayjs/plugin/localizedFormat";

dayjs.extend(localizedFormat);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
