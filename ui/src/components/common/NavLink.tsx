import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import clsx from "clsx";

type Props = Pick<React.ComponentProps<typeof RouterNavLink>, "to" | "end"> & {
  className?: string;
  activeClassName?: string;
};

/**
 * We need another component to wrap React Router's NavLink, to avoid a prop
 * name collision. MUI's Link and NavLink both take a className prop, so in
 * order to forward that prop to NavLink, we have to imitate the old activeClassName
 * behavior from react-router v5.
 */
const NavLink = React.forwardRef<HTMLAnchorElement, Props>(
  ({ activeClassName, className, ...rest }, ref) => (
    <RouterNavLink
      ref={ref}
      className={({ isActive }) => clsx(className, isActive && activeClassName)}
      {...rest}
    />
  )
);

NavLink.displayName = "NavLink";

export default NavLink;
