import { Stack } from "@mui/material";

interface Props {
  children?: React.ReactNode;
}

/**
 * Wrapper for the action buttons that appear at the bottom the screen.
 */
const EditorActions: React.FC<Props> = ({ children }) => (
  <Stack
    direction="row"
    spacing={1}
    sx={{
      position: "absolute",
      bottom: 0,
      width: "100%",
      maxWidth: 400,
      padding: 1,
      justifyContent: "center",

      // Size all children equally
      "& > *": {
        flexGrow: 1,
      },
    }}
  >
    {children}
  </Stack>
);

export default EditorActions;
