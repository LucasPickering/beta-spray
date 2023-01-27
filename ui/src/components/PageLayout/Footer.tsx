import { Box, Divider, Link, Stack, Typography } from "@mui/material";
import { IconGitHub } from "assets";
import useIsWide from "util/useIsWide";

const Footer: React.FC = () => {
  const isWide = useIsWide();

  return (
    <Box
      component="footer"
      margin={2}
      marginTop="auto" // Move to end of flex container
    >
      <Typography component="span" variant="body2">
        <Stack
          direction={isWide ? "row" : "column"}
          alignItems="center"
          spacing={1}
          divider={<Divider orientation="vertical" flexItem />}
        >
          <div>
            <div>Created by Lucas Pickering</div>
          </div>

          <Stack direction="row" alignItems="center" spacing={1}>
            <div>Feedback?</div>

            <Link href="https://github.com/LucasPickering/beta-spray">
              <IconGitHub />
            </Link>
          </Stack>
        </Stack>
      </Typography>
    </Box>
  );
};

export default Footer;
