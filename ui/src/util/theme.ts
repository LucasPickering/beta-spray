import { createTheme } from "@mui/material/styles";

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
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius,
        }),
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
