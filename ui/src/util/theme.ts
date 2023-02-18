import { createTheme, Theme as MuiTheme } from "@mui/material/styles";
import LinkBehavior from "components/common/LinkBehavior";

declare module "@emotion/react/types" {
  // Set Emotion's theme type to the same as Material's
  // We have to use interface/extends because we can't redeclare the type
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Theme extends MuiTheme {}
}

const theme = createTheme({
  palette: {
    // https://coolors.co/0f1c2e-1d3557-ffc848-ff9233-1abbdb
    mode: "dark",
    background: {
      default: "#0F1C2E",
      paper: "#1D3557",
    },
    primary: {
      main: "#FF9233",
    },
    secondary: {
      main: "#48CFEA",
    },
    warning: {
      main: "#FFBE26",
    },
  },
  components: {
    MuiAlert: {
      defaultProps: {
        variant: "filled",
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
    MuiSnackbar: {
      defaultProps: {
        autoHideDuration: 5000,
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          // SvgIcon specifies this for fill, but not stroke.
          // See https://github.com/mui/material-ui/issues/32877
          // (Can be removed if fixed in MUI)
          stroke: "currentColor",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "standard",
      },
    },
    MuiTooltip: {
      defaultProps: {
        enterTouchDelay: 0,
        leaveTouchDelay: 3000,
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
});

export default theme;
