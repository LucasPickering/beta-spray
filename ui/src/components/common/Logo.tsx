import { Box, SvgIcon, SvgIconProps, Typography } from "@mui/material";

/**
 * The full site logo, including the name
 */
const Logo: React.FC = () => (
  <Box display="flex" alignItems="center">
    <IconLogo color="primary" />
    <Typography variant="h5" component="h1" marginLeft={1}>
      Beta Spray
    </Typography>
    <Typography
      variant="caption"
      sx={{ transform: "translate(-6px, -5px) rotate(45deg)" }}
    >
      alpha
    </Typography>
  </Box>
);

/**
 * Standlone logo icon. This is copied in from `logo.svg`, which is the
 * definitive image.
 *
 * TODO import that SVG so we don't have to duplicate it.
 */
export const IconLogo: React.FC<SvgIconProps> = (props) => (
  <SvgIcon viewBox="0 0 100 100" {...props}>
    <circle cx="25" cy="82" r="12" />
    <circle cx="79" cy="60" r="12" />
    <circle cx="43" cy="18" r="12" />
    <line strokeWidth="7" x1="25" y1="82" x2="79" y2="60" />
    <line strokeWidth="7" x1="74" y1="60" x2="43" y2="18" />
  </SvgIcon>
);

export default Logo;
