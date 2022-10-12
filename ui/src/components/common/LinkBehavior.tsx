import { forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";

/**
 * Adapter between MUI link and react-router link. To be used as the default
 * component for MUI links.
 *
 * @see https://mui.com/material-ui/guides/routing/#global-theme-link
 */
const LinkBehavior = forwardRef<HTMLAnchorElement, { href: string }>(
  // Map href (MUI) -> to (react-router)
  ({ href, ...rest }, ref) => <RouterLink ref={ref} to={href} {...rest} />
);

LinkBehavior.displayName = "LinkBehavior";

export default LinkBehavior;
