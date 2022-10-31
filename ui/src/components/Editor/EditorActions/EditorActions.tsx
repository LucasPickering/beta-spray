import { Box } from "@mui/material";

interface Props {
  children?: React.ReactNode;
}

/**
 * Wrapper for the action buttons that appear at the bottom the screen.
 */
const EditorActions: React.FC<Props> = ({ children }) => (
  <Box sx={{ position: "absolute", bottom: 16, right: 16 }}>{children}</Box>
);

export default EditorActions;
