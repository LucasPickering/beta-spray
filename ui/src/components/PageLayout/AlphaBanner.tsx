import { Link, Toolbar } from "@mui/material";

// This color doesn't actually get good contrast, but this is a temporary
// banner so fuck it
const linkColor = "secondary.dark";

const AlphaBanner: React.FC = () => (
  <Toolbar
    sx={({ palette }) => ({
      padding: 1,
      backgroundColor: palette.warning.main,
      color: palette.getContrastText(palette.warning.main),
    })}
  >
    <span>
      This is an <strong>alpha</strong>. It's slow, buggy, and easy to abuse.
      The goal is to <strong>collect feedback</strong>, so let me know what you
      think on{" "}
      <Link href="https://twitter.com/pucaslickering" color={linkColor}>
        Twitter
      </Link>{" "}
      or{" "}
      <Link
        href="https://github.com/LucasPickering/beta-spray"
        color={linkColor}
      >
        GitHub
      </Link>
      .{/* TODO add link to MP post once it's up */}
    </span>
  </Toolbar>
);

export default AlphaBanner;
