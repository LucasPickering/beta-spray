import {
  createTheme,
  Theme as MuiTheme,
  PaletteColor,
  PaletteColorOptions,
} from "@mui/material/styles";
import LinkBehavior from "components/common/LinkBehavior";

// TODO rename
type EditorActionAss<T> = Record<
  | "editorAction--add"
  | "editorAction--relocate"
  | "editorAction--edit"
  | "editorAction--delete",
  T
>;

declare module "@mui/material/styles" {
  interface Palette extends EditorActionAss<PaletteColor> {
    opacity: {
      translucent: number;
    };
  }

  interface PaletteOptions extends EditorActionAss<PaletteColorOptions> {
    opacity: {
      translucent: number;
    };
  }
}

declare module "@mui/material" {
  //
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ButtonPropsColorOverrides extends EditorActionAss<true> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface IconButtonPropsColorOverrides extends EditorActionAss<true> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ToggleButtonPropsColorOverrides extends EditorActionAss<true> {}
}

declare module "@emotion/react/types" {
  // Set Emotion's theme type to the same as Material's
  // We have to use interface/extends because we can't redeclare the type
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Theme extends MuiTheme {}
}

// We have to create the theme in two steps, so we can access palette values in
// the component style overrides
const baseTheme = createTheme({
  palette: {
    // https://coolors.co/0f1c2e-1d3557-ffc848-ff9233-1abbdb
    mode: "dark",
    background: {
      default: "#0F1C2E",
      paper: "#1D3557",
    },
    primary: { main: "#FF9233" },
    secondary: { main: "#48CFEA" },
    info: { main: "#FFC848" },
    warning: { main: "#FFBE26" },

    // TODO better colors
    "editorAction--add": { main: "#00ff00" },
    "editorAction--relocate": { main: "#0000ff" },
    "editorAction--edit": { main: "#ffff00" },
    "editorAction--delete": { main: "#ff0000" },

    opacity: {
      translucent: 0.6,
    },
  },
});
const theme = createTheme(
  {
    components: {
      MuiAlert: {
        defaultProps: {
          variant: "filled",
        },
      },
      MuiBackdrop: {
        styleOverrides: {
          root: {
            zIndex: 1500, // Need to beat drawer and SVG drag layer
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          LinkComponent: LinkBehavior,
        },
      },
      MuiButton: {
        defaultProps: {
          variant: "outlined",
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            display: "flex",
            flexDirection: "column",
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            // Staple actions to the bottom of the card
            marginTop: "auto",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: theme.shape.borderRadius,
            // The `disabled` override class doesn't work because of specificity,
            // so we have to do this instead.
            "&.Mui-disabled": {
              // Fixes wonky looking SVG icons
              strokeOpacity: theme.palette.action.disabledOpacity,
            },
          }),
          sizeSmall: {
            padding: 1,
          },
        },
      },
      MuiLink: {
        defaultProps: {
          // I really can't figure out the typing here, pretty sure it's an MUI
          // bug that they closed as fixed but didn't really fix
          // https://github.com/mui/material-ui/issues/16846
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore 2322
          component: LinkBehavior,
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            // Allows icon to inherit color from the list item
            color: "unset",
          },
        },
      },
      MuiSnackbar: {
        defaultProps: {
          autoHideDuration: 5000,
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "standard",
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            // Match styling of IconButton
            padding: 8,
            border: "none",
          },
        },
      },
      MuiTooltip: {
        defaultProps: {
          leaveTouchDelay: 3000,
        },
        styleOverrides: {
          tooltip: {
            backgroundColor: baseTheme.palette.background.paper,
            // This seems to be the most prominent shadow in the theme
            boxShadow: baseTheme.shadows[24],
            fontSize: baseTheme.typography.subtitle2.fontSize,
          },
        },
      },
      MuiTypography: {
        defaultProps: {
          // <p> tags aren't actually what we want in most cases, so make them
          // explicit.
          // NOTE: do *NOT* override `component` here, or it will effectively
          // disable the `paragraph` and `variantMapping` props in all places,
          // since `component` always takes precedence
          variantMapping: {
            body1: "div",
            body2: "div",
            inherit: "div",
          },
        },
      },
    },
  },
  baseTheme
);

export default theme;
