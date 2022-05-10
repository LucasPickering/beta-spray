import {
  createTheme,
  PaletteColor,
  PaletteColorOptions,
} from "@mui/material/styles";
import { BodyPart } from "util/svg";

declare module "@mui/material/styles" {
  interface Palette {
    [BodyPart.LEFT_HAND]: PaletteColor;
    [BodyPart.RIGHT_HAND]: PaletteColor;
    [BodyPart.LEFT_FOOT]: PaletteColor;
    [BodyPart.RIGHT_FOOT]: PaletteColor;
  }

  interface PaletteOptions {
    [BodyPart.LEFT_HAND]: PaletteColorOptions;
    [BodyPart.RIGHT_HAND]: PaletteColorOptions;
    [BodyPart.LEFT_FOOT]: PaletteColorOptions;
    [BodyPart.RIGHT_FOOT]: PaletteColorOptions;
  }
}

// 3. Update the Button's color prop options
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    [BodyPart.LEFT_HAND]: true;
    [BodyPart.RIGHT_HAND]: true;
    [BodyPart.LEFT_FOOT]: true;
    [BodyPart.RIGHT_FOOT]: true;
  }
}

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#202020",
    },
    primary: {
      main: "#add8e6",
    },

    [BodyPart.LEFT_HAND]: { main: "#ffff00", contrastText: "#000000" },
    [BodyPart.RIGHT_HAND]: { main: "#f08080", contrastText: "#000000" },
    [BodyPart.LEFT_FOOT]: { main: "#90ee90", contrastText: "#000000" },
    [BodyPart.RIGHT_FOOT]: { main: "#add8e6", contrastText: "#000000" },
  },
  components: {
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterTouchDelay: 0,
        leaveTouchDelay: 3000,
      },
    },
  },
});

export default theme;
