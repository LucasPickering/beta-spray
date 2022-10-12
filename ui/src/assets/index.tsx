/**
 * A convenient export location for all static icons that are defined in the
 * assets folder.
 */

import { SvgIcon, SvgIconProps } from "@mui/material";
import GitHubLogo from "./github.svg";
import TwitterLogo from "./twitter.svg";

export const IconGitHub: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={GitHubLogo} inheritViewBox {...props} />
);

export const IconTwitter: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={TwitterLogo} inheritViewBox {...props} />
);
