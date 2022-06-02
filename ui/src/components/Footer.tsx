import { Box, Link, Typography } from "@mui/material";
import React from "react";

const Footer: React.FC = () => (
  <Box
    component="footer"
    // width="100%"
    display="flex"
    justifyContent="center"
    margin={2}
    marginTop="auto" // Move to end of flex container
  >
    <Typography component="span" variant="body2">
      Created by Lucas Pickering |{" "}
      <Link href="https://github.com/LucasPickering/beta-spray">GitHub</Link> |{" "}
      <Link href="https://github.com/LucasPickering/beta-spray/issues/new">
        Report a Bug
      </Link>
    </Typography>
  </Box>
);

export default Footer;
