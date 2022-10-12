import React from "react";
import { Link as MuiLink, useTheme } from "@mui/material";
import NavLink from "./NavLink";
import { ClassNames } from "@emotion/react";

type Props = React.ComponentProps<typeof MuiLink> &
  React.ComponentProps<typeof NavLink>;

const HeaderLink = React.forwardRef<HTMLAnchorElement, Props>((props, ref) => {
  const { palette, spacing } = useTheme();

  return (
    <ClassNames>
      {({ css }) => (
        <MuiLink
          ref={ref}
          component={NavLink}
          activeClassName={css({ backgroundColor: palette.background.default })}
          color="inherit"
          variant="h6"
          underline="hover"
          padding={`${spacing(1)} ${spacing(2)}`}
          sx={{ height: "100%" }}
          {...props}
        />
      )}
    </ClassNames>
  );
});

HeaderLink.displayName = "HeaderLink";

export default HeaderLink;
