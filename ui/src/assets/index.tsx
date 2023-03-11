/**
 * A convenient export location for all static icons that are defined in the
 * assets folder.
 */

import { SvgIcon, SvgIconProps } from "@mui/material";
import GitHubLogo from "./github.svg";
import GoogleLogo from "./google.svg";
import BetaSprayLogo from "./beta_spray.svg";
import InstagramLogo from "./instagram.svg";

export const IconGitHub: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={GitHubLogo} inheritViewBox {...props} />
);

export const IconGoogle: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={GoogleLogo} inheritViewBox {...props} />
);

export const IconBetaSpray: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={BetaSprayLogo} inheritViewBox {...props} />
);

export const IconInstagram: React.FC<SvgIconProps> = (props) => (
  <SvgIcon component={InstagramLogo} inheritViewBox {...props} />
);
