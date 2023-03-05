import { Box, Typography } from "@mui/material";

interface Props {
  children?: React.ReactNode;
}

/**
 * Container to slap a "Coming Soon" label on an element. You should probably
 * also disable the element yourself.
 */
const ComingSoon: React.FC<Props> = ({ children }) => (
  <Box sx={{ position: "relative" }}>
    <Typography
      sx={{
        position: "absolute",
        fontWeight: "bold",
        transform: "rotate(-30deg) translateY(100%)",
      }}
    >
      Coming Soon
    </Typography>
    {children}
  </Box>
);

export default ComingSoon;
