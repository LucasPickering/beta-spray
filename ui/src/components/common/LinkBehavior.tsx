import { forwardRef } from "react";
import { Link as RouterLink } from "react-router-dom";

/**
 * Adapter between MUI link and react-router/external link. To be used as the
 * default component for MUI links.
 *
 * @see https://mui.com/material-ui/guides/routing/#global-theme-link
 */
const LinkBehavior = forwardRef<HTMLAnchorElement, { href: string }>(
  ({ href, ...rest }, ref) => {
    // If the link is external, just use a raw anchor element. The auth process
    // also redirects to API routes, so we need to consider those external
    if (/^(https?:\/\/|\/api\/)/.test(href)) {
      // Children are being passed implicitly
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      return <a ref={ref} href={href} {...rest} />;
    }

    // Map href (MUI) -> to (react-router)
    return <RouterLink ref={ref} to={href} {...rest} />;
  }
);

LinkBehavior.displayName = "LinkBehavior";

export default LinkBehavior;
