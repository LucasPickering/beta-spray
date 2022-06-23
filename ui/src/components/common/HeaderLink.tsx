import React from "react";
import { Link as MuiLink, useTheme } from "@mui/material";
import NavLink from "./NavLink";
import { ClassNames } from "@emotion/react";

type Props = React.ComponentProps<typeof MuiLink> &
  React.ComponentProps<typeof NavLink>;

const HeaderLink = React.forwardRef<HTMLAnchorElement, Props>((props, ref) => {
  const { palette } = useTheme();
  return (
    <ClassNames>
      {({ css }) => (
        <MuiLink
          ref={ref}
          component={NavLink}
          activeClassName={css({
            // I can't figure out how to give emotion higher precedence than MUI
            // so we need !important here. I tried this:
            // https://mui.com/material-ui/guides/interoperability/#css-injection-order
            // But that didn't work
            color: `${palette.primary.main} !important`,
          })}
          color="inherit"
          variant="h6"
          underline="hover"
          paddingLeft={2}
          sx={{ height: "100%" }}
          {...props}
        />
      )}
    </ClassNames>
  );
});

HeaderLink.displayName = "HeaderLink";

export default HeaderLink;
