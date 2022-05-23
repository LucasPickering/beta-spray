import { SvgIcon, SvgIconProps } from "@mui/material";
import React from "react";

export const IconLogo: React.FC<SvgIconProps> = (props) => (
  // TODO remove stroke prop after https://github.com/mui/material-ui/issues/32877
  <SvgIcon viewBox="0 0 100 100" stroke="currentColor" {...props}>
    <circle cx="20" cy="82" r="12" />
    <circle cx="74" cy="60" r="12" />
    <circle cx="38" cy="18" r="12" />
    <line strokeWidth="7" x1="20" y1="82" x2="74" y2="60" />
    <line strokeWidth="7" x1="74" y1="60" x2="38" y2="18" />
  </SvgIcon>
);
