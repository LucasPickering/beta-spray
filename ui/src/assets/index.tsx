/**
 * A convenient export location for all static icons that are defined in the
 * assets folder.
 */

import { SvgIcon, SvgIconProps } from "@mui/material";
import GitHubLogo from "./github.svg";
import BetaSprayLogo from "./beta_spray.svg";

export const IconGitHub: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={GitHubLogo} inheritViewBox {...props} />
);

export const IconBetaSpray: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={BetaSprayLogo} inheritViewBox {...props} />
);
