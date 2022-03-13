import { createTheme } from "@mui/material/styles";
import { BodyPart } from "components/Editor/EditorOverlay/types";

declare module "@mui/material/styles" {
  interface Theme {
    bodyParts: Record<BodyPart, React.CSSProperties["color"]>;
  }

  interface ThemeOptions {
    bodyParts: Record<BodyPart, React.CSSProperties["color"]>;
  }
}

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  bodyParts: {
    [BodyPart.LEFT_HAND]: "yellow",
    [BodyPart.RIGHT_HAND]: "lightcoral",
    [BodyPart.LEFT_FOOT]: "lightgreen",
    [BodyPart.RIGHT_FOOT]: "lightblue",
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
  },
});

export default theme;
