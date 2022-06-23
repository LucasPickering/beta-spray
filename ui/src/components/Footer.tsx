import { Box, Divider, Link, Stack, Typography } from "@mui/material";
import React from "react";

const Footer: React.FC = () => (
  <Box
    component="footer"
    margin={2}
    marginTop="auto" // Move to end of flex container
  >
    <Typography component="span" variant="body2">
      <Stack
        direction="row"
        spacing={1}
        divider={<Divider orientation="vertical" flexItem />}
      >
        <span>Created by Lucas Pickering</span>
        <Link component="a" href="https://github.com/LucasPickering/beta-spray">
          Code
        </Link>
        <Link
          component="a"
          href="https://github.com/LucasPickering/beta-spray/issues/new"
        >
          Report a Bug
        </Link>
      </Stack>
    </Typography>
  </Box>
);

export default Footer;
