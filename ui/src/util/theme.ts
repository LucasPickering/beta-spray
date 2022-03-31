import { createTheme } from "@mui/material/styles";
import { BodyPart } from "components/Editor/EditorOverlay/types";

declare module "@mui/material/styles" {
  interface Palette {
    bodyParts: Record<BodyPart, string>;
  }

  interface PaletteOptions {
    bodyParts: Record<BodyPart, string>;
  }
}

const theme = createTheme({
  palette: {
    mode: "dark",
    bodyParts: {
      [BodyPart.LEFT_HAND]: "#ffff00",
      [BodyPart.RIGHT_HAND]: "#f08080",
      [BodyPart.LEFT_FOOT]: "#90ee90",
      [BodyPart.RIGHT_FOOT]: "#add8e6",
    },
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
