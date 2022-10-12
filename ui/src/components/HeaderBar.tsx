import {
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import useIsWide from "util/useIsWide";
import HeaderLink from "./common/HeaderLink";
import Logo from "./common/Logo";
import NavLink from "./common/NavLink";
import ToggleDrawer from "./common/ToggleDrawer";

const links = [
  { to: "/", label: "Problems" },
  { to: "why", label: "Why?" },
];

interface Props {
  children?: React.ReactNode;
}

const HeaderBar: React.FC<Props> = ({ children }) => {
  // We'll automatically put the links in a drawer on narrow screens
  const isWide = useIsWide();

  return (
    <Toolbar variant="dense">
      {!isWide && (
        <ToggleDrawer
          ButtonProps={{
            size: "small",
            "aria-label": "Open Navigation",
            sx: { marginRight: 2 },
          }}
        >
          <List component="nav">
            {links.map(({ to, label }) => (
              <ListItem
                key={to}
                component={NavLink}
                to={to}
                // Use built-in ListItem selected styles for active link
                activeClassName="Mui-selected"
                disablePadding
                sx={{ color: "inherit" }}
              >
                <ListItemButton>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </ToggleDrawer>
      )}

      <Typography component="h1" variant="h5">
        <Link href="/" sx={{ textDecoration: "none" }}>
          <Logo />
        </Link>
      </Typography>

      {isWide && (
        <Stack direction="row" component="nav" spacing={2} marginLeft={2}>
          {links.map(({ to, label }) => (
            <HeaderLink key={to} to={to} end>
              {label}
            </HeaderLink>
          ))}
        </Stack>
      )}

      {children}
    </Toolbar>
  );
};

export default HeaderBar;
