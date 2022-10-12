import { Link, Stack, Typography } from "@mui/material";
import { IconGitHub, IconTwitter } from "assets";

const About: React.FC = () => (
  <>
    <Typography component="h2" variant="h4">
      Why?
    </Typography>
    <Typography paragraph>
      Ever try to share beta over text? It sucks. Now you don&apos;t have to.
      Just upload your problem, send a link and unlock a whole new level of
      spraying potential. Or, maybe you&apos;re &quot;working&quot; from home
      and you can&apos;t stop thinking about your project. Instead of thinking,
      now you&apos;re planning. Snap a photo, upload, and get drawing.
    </Typography>

    <Typography component="h2" variant="h4">
      Contact
    </Typography>
    <Typography paragraph>
      If you have any feedback on the site, please tell me! Click the things,
      type the words, etc.
    </Typography>

    <Stack direction="row" alignItems="center" spacing={2}>
      <Link href="https://twitter.com/pucaslickering">
        <IconTwitter fontSize="large" />
      </Link>
      <Link href="https://github.com/LucasPickering/beta-spray">
        <IconGitHub fontSize="large" />
      </Link>
      {/* TODO add link to MP post once it's up */}
    </Stack>
  </>
);

export default About;
