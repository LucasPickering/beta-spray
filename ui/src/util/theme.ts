import { createTheme } from "@mui/material/styles";
import LinkBehavior from "components/common/LinkBehavior";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#121212",
      paper: "#202020",
    },
    primary: {
      main: "#f08080",
    },
    secondary: {
      main: "#00b0ff",
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
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
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
    MuiTooltip: {
      defaultProps: {
        enterTouchDelay: 0,
        leaveTouchDelay: 3000,
      },
    },
  },
});

export default theme;
