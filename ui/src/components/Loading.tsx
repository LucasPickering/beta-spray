import { CircularProgress } from "@mui/material";
import React from "react";

/**
 * Loading icon. *Warning:* Do *not* use this from the app root, because it
 * pulls in Material UI, which we don't want in the entrypoint chunk.
 */
const Loading: React.FC = () => <CircularProgress />;

export default Loading;
